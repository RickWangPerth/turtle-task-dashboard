import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { createClient } from "@/lib/supabase/server";
import { updateTask } from "../../actions";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Sprint = Database["public"]["Tables"]["sprints"]["Row"];

type EditTaskPageProps = {
  params: {
    id: string;
  };
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const supabase = createClient();
  const [
    { data: task, error: taskError },
    { data: profiles, error: profilesError },
    { data: sprints, error: sprintsError },
  ] = await Promise.all([
      supabase.from("tasks").select("*").eq("id", params.id).single(),
      supabase
        .from("profiles")
        .select("*")
        .order("display_name", { ascending: true }),
      supabase
        .from("sprints")
        .select("*")
        .order("start_date", { ascending: false }),
    ]);

  if (taskError || !task) {
    notFound();
  }

  if (profilesError || sprintsError) {
    throw new Error(profilesError?.message ?? sprintsError?.message);
  }

  const currentTask = task as Task;
  const allProfiles = (profiles ?? []) as Profile[];
  const allSprints = (sprints ?? []) as Sprint[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${currentTask.task_code}`}
        description="Update task fields. Status changes are recorded by the database trigger."
      />
      <TaskForm
        action={updateTask.bind(null, currentTask.id)}
        profiles={allProfiles}
        sprints={allSprints}
        submitLabel="Save task"
        task={currentTask}
      />
    </div>
  );
}
