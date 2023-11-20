import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

import { api } from "@/utils/api";

interface FormMenuItemProps {
  id: string;
  name: string;
  updatedAt: Date;
  refetchFormList: () => void;
}

export default function FormMenuItem({
  id,
  name,
  updatedAt,
  refetchFormList,
}: FormMenuItemProps) {
  const { mutateAsync: deleteForm, isLoading } =
    api.form.deleteForm.useMutation();

  const handleDeleteForm = async () => {
    if (!id || isLoading) return;
    try {
      await deleteForm({ formId: id });
      refetchFormList();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <li
      key={id}
      className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
    >
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {name}
            </h3>
            <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Submitted
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            Last Updated:
            {" " + updatedAt.toUTCString()}
          </p>
        </div>
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="flex w-0 flex-1">
            <Link
              href={`/form/${id}`}
              className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <PencilIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              Edit
            </Link>
          </div>
          <div className="-ml-px flex w-0 flex-1">
            <button
              onClick={() => handleDeleteForm()}
              className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
            >
              <TrashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
