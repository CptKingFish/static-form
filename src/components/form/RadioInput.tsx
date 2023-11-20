import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { type FormItemOption } from "@prisma/client";

import { type FormData } from "@/models/Form";

interface RadioInputProps {
  id: string;
  index: number;
  text: string;
  options: FormItemOption[];
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function RadioInput({
  id,
  index,
  text,
  options,
  register,
  errors,
}: RadioInputProps) {
  return (
    <fieldset>
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
      <div className="mt-6 space-y-6">
        {options.map((option) => (
          <div className="relative flex gap-x-3" key={option.id}>
            <div className="flex h-6 items-center">
              <input
                id={option.id}
                value={option.id}
                type="radio"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                {...register(id)}
              />
            </div>
            <div className="text-sm leading-6">
              <label htmlFor={option.id} className="font-medium text-gray-900">
                {option.text}
              </label>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
