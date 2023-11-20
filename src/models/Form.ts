import { z } from "zod";
import type { FormItem } from "@prisma/client";

const textFieldSchema = z
  .string()
  .trim()
  .min(2, { message: "Name must be 2 or more characters long" });

const emailFieldSchema = z
  .string()
  .email("Please enter a valid email address")
  .trim()
  .toLowerCase();

const checkboxFieldSchema = z
  .array(z.string(), {
    invalid_type_error: "Please select at least one item",
  })
  .min(1, { message: "Please select at least one item" });

const radioFieldSchema = z.string({
  invalid_type_error: "Please select one item",
});

const dropdownFileSchema = z.string({
  invalid_type_error: "Please select one item",
});

const fileFieldSchema = z.string().url({
  message: "Please upload a file",
});

const dateFieldSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

const timeFieldSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid time format");

const getFieldSchemaByType = (type: string) => {
  switch (type) {
    case "TEXT":
      return textFieldSchema;
    case "EMAIL":
      return emailFieldSchema;
    case "CHECKBOX":
      return checkboxFieldSchema;
    case "RADIO":
      return radioFieldSchema;
    case "DROPDOWN":
      return dropdownFileSchema;
    case "FILE":
      return fileFieldSchema;
    case "DATE":
      return dateFieldSchema;
    case "TIME":
      return timeFieldSchema;
  }
};

export const generateDynamicFormSchema = (formItems: FormItem[]) => {
  const dynamicFormSchema = formItems.reduce((acc, item) => {
    return {
      ...acc,
      [item.id]: getFieldSchemaByType(item.type),
    };
  }, {});
  console.log("dynamicFormSchema", dynamicFormSchema);

  return z.object(dynamicFormSchema);
};

const formItemSchema = z.record(z.string());

export type FormData = z.infer<typeof formItemSchema>;
