import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { createClient } from "@/lib/supabase/server";
import { createTask } from "../actions";

export default async function NewTaskPage() {
  const supabase = createClient();
  const [{ data: profiles, error }, { data: sprints, error: sprintsError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("display_name", { ascending: true }),
      supabase
        .from("sprints")
        .select("*")
        .order("start_date", { ascending: false }),
    ]);

  if (error || sprintsError) {
    throw new Error(error?.message ?? sprintsError?.message);
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
        sprints={sprints ?? []}
        submitLabel="Create task"
      />
    </div>
  );
}
