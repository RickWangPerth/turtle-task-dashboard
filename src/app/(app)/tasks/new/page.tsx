import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { createClient } from "@/lib/supabase/server";
import { createTask } from "../actions";

export default async function NewTaskPage() {
  const supabase = createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New task"
        description="Create a task record. The database will assign the task code."
      />
      <TaskForm
        action={createTask}
        profiles={profiles ?? []}
        submitLabel="Create task"
      />
    </div>
  );
}
