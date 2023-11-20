import { type FieldErrors, type UseFormRegister } from "react-hook-form";

import { type FormData } from "@/models/Form";
import { type FormItemOption } from "@prisma/client";

interface DropdownInputProps {
  id: string;
  index: number;
  text: string;
  options: FormItemOption[];
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function DropdownInput({
  id,
  index,
  text,
  options,
  register,
  errors,
}: DropdownInputProps) {
  return (
    <>
      <div className="flex justify-between">
        <label className="text-md block font-medium leading-6 text-gray-900">
          {text}
        </label>
        {errors?.[id] && (
          <p className="self-start rounded-md px-2 italic text-red-500">
            {errors?.[id]?.message ?? "This field is required"}
          </p>
        )}
      </div>
      <div className="mt-2">
        <select
          id="dropdown"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          {...register(id)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
