import { type FieldErrors, type UseFormRegister } from "react-hook-form";

import { type FormData } from "@/models/Form";

interface EmailInputProps {
  id: string;
  index: number;
  text: string;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function EmailInput({
  id,
  index,
  text,
  register,
  errors,
}: EmailInputProps) {
  return (
    <>
      <div className="flex justify-between">
        <label
          htmlFor="email"
          className="text-md block font-medium leading-6 text-gray-900"
        >
          {text}
        </label>
        {errors?.[id] && (
          <p className="self-start rounded-md px-2 italic text-red-500">
            {errors?.[id]?.message ?? "This field is required"}
          </p>
        )}
      </div>

      <div className="mt-2">
        <input
          type="text"
          id="email"
          className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="kaung@gmail.com"
          {...register(id)}
        />
      </div>
    </>
  );
}
