import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { createClient } from "@/lib/supabase/server";
import { createTask } from "../actions";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function NewTaskPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [
    { data: profiles, error },
    { data: sprints, error: sprintsError },
    { data: currentProfile },
  ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("display_name", { ascending: true }),
      supabase
        .from("sprints")
        .select("*")
        .order("start_date", { ascending: false }),
      user
        ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (error || sprintsError) {
    throw new Error(error?.message ?? sprintsError?.message);
  }
  const currentRole =
    (currentProfile as Pick<Profile, "role"> | null)?.role ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New task"
        description="Create a task record. The database will assign the task code."
      />
      <TaskForm
        action={createTask}
        profiles={profiles ?? []}
        role={currentRole}
        sprints={sprints ?? []}
        submitLabel="Create task"
      />
    </div>
  );
}
