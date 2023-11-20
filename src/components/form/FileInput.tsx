import { type FieldErrors, type UseFormRegister } from "react-hook-form";

import { type FormData } from "@/models/Form";
import { UploadDropzone } from "@/utils/uploadthing";
import { useState } from "react";
import Image from "next/image";

interface FileInputProps {
  id: string;
  index: number;
  text: string;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function FileInput({
  id,
  index,
  text,
  register,
  errors,
}: FileInputProps) {
  const [url, setUrl] = useState<string>("");
  return (
    <div className="col-span-full">
      <div className="flex justify-between">
        <label
          htmlFor="file"
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
      <div className="mt-2 flex flex-row items-center justify-between rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
        <div className="text-center">
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                type="text"
                value={url}
                className="sr-only"
                {...register(id)}
              />
              <UploadDropzone
                endpoint={"imageUpload"}
                onClientUploadComplete={(res) => {
                  setUrl(res?.[0]?.url ?? "");
                }}
                onUploadError={(error: Error) => {
                  console.log(error);
                }}
              />
              <button
                type="button"
                className="mt-3 w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setUrl("");
                }}
              >
                Clear
              </button>
            </label>
            {/* <p className="pl-1">or drag and drop</p> */}
          </div>
        </div>
        {url && (
          <Image
            src={url}
            width={400}
            height={500}
            alt="uploaded img"
            className="h-64"
          />
        )}
      </div>
    </div>
  );
}
