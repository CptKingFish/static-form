import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
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

      // Execute all operations in a transaction
      const result = await ctx.db.$transaction(formItemCreations);

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
          z.union([z.string(), z.array(z.string()), z.number()]),
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
        throw new Error("Form not found");
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
        if (type in ["RADIO", "DROPDOWN"]) {
          if (!response || typeof response !== "string") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid response",
            });
          }
        } else if (type in ["CHECKBOX"]) {
          if (!Array.isArray(response)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid response",
            });
          }
        } else if (type in ["TEXT", "EMAIL", "FILE", "DATE", "TIME"]) {
          if (!response || typeof response !== "string") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid response",
            });
          }
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid response",
          });
        }

        if (existingResponse) {
          if (type in ["RADIO", "DROPDOWN"]) {
            return ctx.db.formItemResponse.update({
              where: { id: existingResponse.id },
              data: {
                options: {
                  set: [response as string],
                },
              },
            });
          } else if (type in ["CHECKBOX"]) {
            return ctx.db.formItemResponse.update({
              where: { id: existingResponse.id },
              data: {
                options: {
                  set: response as string[],
                },
              },
            });
          } else {
            return ctx.db.formItemResponse.update({
              where: { id: existingResponse.id },
              data: {
                response: response as string,
              },
            });
          }
        } else {
          // Create new response
          return ctx.db.formItemResponse.create({
            data: {
              formItemId: item.id,
              userId: ctx.session.user.id,
              optionId: response,
            },
          });
        }
      });

      // Execute all operations in a transaction
      const result = await ctx.db.$transaction(formItemResponseCreations);

      return result;
    }),
});
