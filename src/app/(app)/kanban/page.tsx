import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge } from "@/components/badges";
import { createClient } from "@/lib/supabase/server";
import { TASK_STATUSES, type TaskStatus } from "@/lib/tasks/constants";
import { formatDateTime } from "@/lib/tasks/format";
import { updateTaskStatus } from "../tasks/actions";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function personLabel(task: Task, profiles: Map<string, Profile>) {
  if (task.owner_id) {
    const owner = profiles.get(task.owner_id);
    return owner?.display_name ?? owner?.email ?? "Assigned";
  }

  return task.requester ?? "Unassigned";
}

function Column({
  profiles,
  status,
  tasks,
}: {
  profiles: Map<string, Profile>;
  status: TaskStatus;
  tasks: Task[];
}) {
  return (
    <section className="flex min-h-96 min-w-72 flex-col rounded-lg border border-border bg-slate-50">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{status}</h2>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-muted">
          {tasks.length}
        </span>
      </header>

      <div className="flex-1 space-y-3 p-3">
        {tasks.length ? (
          tasks.map((task) => (
            <article
              className="rounded-lg border border-border bg-white p-4 shadow-sm"
              key={task.id}
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  className="text-sm font-semibold text-ink hover:underline"
                  href={`/tasks/${task.id}`}
                >
                  {task.task_code}
                </Link>
                <PriorityBadge priority={task.priority} />
              </div>
              <Link
                className="mt-2 block text-sm font-medium leading-5 text-ink hover:underline"
                href={`/tasks/${task.id}`}
              >
                {task.title}
              </Link>
              <dl className="mt-3 space-y-2 text-xs text-muted">
                <div>
                  <dt className="font-medium uppercase tracking-wide">Epic</dt>
                  <dd className="mt-0.5">{task.epic ?? "-"}</dd>
                </div>
                <div>
                  <dt className="font-medium uppercase tracking-wide">Owner</dt>
                  <dd className="mt-0.5">{personLabel(task, profiles)}</dd>
                </div>
                <div>
                  <dt className="font-medium uppercase tracking-wide">
                    Updated
                  </dt>
                  <dd className="mt-0.5">{formatDateTime(task.updated_at)}</dd>
                </div>
              </dl>

              <form
                action={updateTaskStatus.bind(null, task.id)}
                className="mt-4 flex gap-2"
              >
                <select
                  className="min-w-0 flex-1 rounded-md border border-border bg-white px-2 py-2 text-xs text-ink"
                  defaultValue={task.status}
                  name="status"
                >
                  {TASK_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button
                  className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                  type="submit"
                >
                  Save
                </button>
              </form>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-white p-4 text-sm text-muted">
            No tasks.
          </p>
        )}
      </div>
    </section>
  );
}

export default async function KanbanPage() {
  const supabase = createClient();
  const [{ data: tasks, error: tasksError }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase.from("profiles").select("*"),
    ]);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const taskRows = (tasks ?? []) as Task[];
  const profileMap = new Map(
    ((profiles ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );
  const tasksByStatus = new Map<TaskStatus, Task[]>(
    TASK_STATUSES.map((status) => [status, []]),
  );

  for (const task of taskRows) {
    tasksByStatus.get(task.status)?.push(task);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban"
        description="Status board generated from the live task table."
      />

      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-max grid-cols-7 gap-4">
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              profiles={profileMap}
              status={status}
              tasks={tasksByStatus.get(status) ?? []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
