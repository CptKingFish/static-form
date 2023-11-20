import { api } from "@/utils/api";
import FormMenuItem from "./FormMenuItem";

export default function FormMenu() {
  const { data: forms, refetch: refetchFormList } =
    api.form.getFormList.useQuery();
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {forms?.map((form) => (
        <FormMenuItem
          key={form.id}
          id={form.id}
          name={form.name}
          updatedAt={form.updatedAt}
          refetchFormList={refetchFormList}
        />
      ))}
    </ul>
  );
}
