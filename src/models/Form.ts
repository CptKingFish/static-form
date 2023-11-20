import { z } from "zod";
import type { FormItem } from "@prisma/client";

const baseStringField = z.string().trim();

const textFieldSchema = baseStringField.min(2, {
  message: "Name must be at least 2 characters long.",
});

const emailFieldSchema = baseStringField
  .email({ message: "Please enter a valid email address." })
  .transform((str) => str.toLowerCase());

const checkboxFieldSchema = z
  .array(z.string())
  .min(1, { message: "Please select at least one option." });

const radioFieldSchema = baseStringField.min(1, {
  message: "Please select an option.",
});

const dropdownFieldSchema = baseStringField.min(1, {
  message: "Please select an option.",
});

const fileFieldSchema = z
  .string()
  .url({ message: "Invalid file URL. Please upload a file." });

const dateFieldSchema = baseStringField.regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Invalid date format. Please use YYYY-MM-DD.",
);

const timeFieldSchema = baseStringField.regex(
  /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
  "Invalid time format. Please use HH:MM or HH:MM:SS.",
);

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
      return dropdownFieldSchema;
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

  return z.object(dynamicFormSchema);
};

const formItemSchema = z.record(z.string());

export type FormData = z.infer<typeof formItemSchema>;
