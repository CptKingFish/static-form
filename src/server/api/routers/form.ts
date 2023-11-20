import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

type FormItemType =
  | "TEXT"
  | "EMAIL"
  | "CHECKBOX"
  | "RADIO"
  | "DROPDOWN"
  | "FILE"
  | "DATE"
  | "TIME";

type FormItem = {
  text: string;
  type: FormItemType;
  options?: string[]; // Optional, as not all items have options
};

const formItems: FormItem[] = [
  {
    text: "Name",
    type: "TEXT",
  },
  {
    text: "Email",
    type: "EMAIL",
  },
  {
    text: "Occupation",
    type: "CHECKBOX",
    options: ["Programmer", "Designer", "Other"],
  },
  {
    text: "Gender",
    type: "RADIO",
    options: ["Male", "Female", "Other"],
  },
  {
    text: "Country",
    type: "DROPDOWN",
    options: ["USA", "Canada", "Mexico"],
  },
  {
    text: "File",
    type: "FILE",
  },
  {
    text: "Date of Birth",
    type: "DATE",
  },
  {
    text: "Time of Arrival",
    type: "TIME",
  },
];

export const formRouter = createTRPCRouter({
  getFormList: protectedProcedure.query(async ({ ctx }) => {
    const forms = await ctx.db.form.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
    });
    return forms;
  }),
  getFormData: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const formData = await ctx.db.form.findUnique({
        where: { id: input.formId },
        include: {
          items: {
            include: {
              responses: {
                where: { userId: ctx.session.user.id },
                include: {
                  options: true, // Include this if you want details about the chosen option
                },
              },
              options: true, // Include this if you want all available options for each item
            },
          },
        },
      });
      return formData;
    }),

  createForm: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      const formItemCreations = formItems.map((item) => {
        if (item.options && item.options.length > 0) {
          // For items with options, create the item and its options
          return ctx.db.formItem.create({
            data: {
              text: item.text,
              type: item.type,
              formId: form.id,
              options: {
                create: item.options.map((optionText) => ({
                  text: optionText,
                })),
              },
            },
          });
        } else {
          // For items without options, just create the item
          return ctx.db.formItem.create({
            data: {
              text: item.text,
              type: item.type,
              formId: form.id,
            },
          });
        }
      });

      await ctx.db.$transaction(formItemCreations);

      return form;
    }),

  deleteForm: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const formItemIds = await ctx.db.formItem.findMany({
        where: { formId: input.formId },
        select: { id: true },
      });
      const result = await ctx.db.$transaction([
        ctx.db.formItemResponse.deleteMany({
          where: {
            formItemId: {
              in: formItemIds.map((item) => item.id),
            },
          },
        }),
        ctx.db.formItemOption.deleteMany({
          where: {
            formItemId: {
              in: formItemIds.map((item) => item.id),
            },
          },
        }),
        ctx.db.formItem.deleteMany({
          where: { formId: input.formId },
        }),
        ctx.db.form.delete({
          where: { id: input.formId },
        }),
      ]);

      return result;
    }),

  submitForm: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        responses: z.record(
          z.string(),
          z.union([z.string(), z.array(z.string())]),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        include: {
          items: {
            include: {
              options: true,
            },
          },
        },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      const formItemIdsAndTypes = form.items.map((item) => {
        return {
          id: item.id,
          type: item.type,
        };
      });

      const formItemResponses = await ctx.db.formItemResponse.findMany({
        where: {
          formItemId: {
            in: formItemIdsAndTypes.map((item) => item.id),
          },
          userId: ctx.session.user.id,
        },
      });

      const formItemResponseCreations = form.items.map((item) => {
        const response = input.responses[item.id];
        const type = item.type;
        const existingResponse = formItemResponses.find(
          (r) => r.formItemId === item.id,
        );

        // validate response
        if (["RADIO", "DROPDOWN"].includes(type)) {
          if (!response || typeof response !== "string") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid radio/dropdown response",
            });
          }

          if (existingResponse) {
            return ctx.db.formItemResponse.update({
              where: { id: existingResponse.id },
              data: {
                options: {
                  connect: { id: response },
                },
              },
            });
          } else {
            return ctx.db.formItemResponse.create({
              data: {
                formItemId: item.id,
                userId: ctx.session.user.id,
                options: {
                  connect: { id: response },
                },
              },
            });
          }
        } else if (["CHECKBOX"].includes(type)) {
          if (!Array.isArray(response)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid checkbox response",
            });
          }

          if (existingResponse) {
            return ctx.db.formItemResponse.update({
              where: { id: existingResponse.id },
              data: {
                options: {
                  connect: response.map((optionId) => ({
                    id: optionId,
                  })),
                },
              },
            });
          } else {
            return ctx.db.formItemResponse.create({
              data: {
                formItemId: item.id,
                userId: ctx.session.user.id,
                options: {
                  connect: response.map((optionId) => ({
                    id: optionId,
                  })),
                },
              },
            });
          }
        } else if (["TEXT", "EMAIL", "FILE", "DATE", "TIME"].includes(type)) {
          if (!response || typeof response !== "string") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid text/email/file/date/time response",
            });
          }
          if (existingResponse) {
            return ctx.db.formItemResponse.update({
              where: { id: existingResponse.id },
              data: {
                response: response,
              },
            });
          } else {
            return ctx.db.formItemResponse.create({
              data: {
                formItemId: item.id,
                userId: ctx.session.user.id,
                response: response,
              },
            });
          }
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid response",
          });
        }
      });

      // Execute all operations in a transaction
      const result = await ctx.db.$transaction(formItemResponseCreations);

      await ctx.db.form.update({
        where: { id: form.id },
        data: {
          updatedAt: new Date(),
        },
      });

      return result;
    }),
});
