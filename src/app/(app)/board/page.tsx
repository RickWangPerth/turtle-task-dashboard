import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge } from "@/components/badges";
import { SaveNotice } from "@/components/save-notice";
import { createClient } from "@/lib/supabase/server";
import {
  BOARD_STATUSES,
  TASK_STATUSES,
  type TaskStatus,
} from "@/lib/tasks/constants";
import { formatDateTime } from "@/lib/tasks/format";
import { updateTaskStatus } from "../tasks/actions";
import type { Database } from "@/lib/supabase/types";

type BoardPageProps = {
  searchParams?: {
    assignee?: string;
    saved?: string;
    sprint?: string;
  };
};

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Sprint = Database["public"]["Tables"]["sprints"]["Row"];

function profileName(profile: Profile | undefined) {
  return profile?.display_name ?? profile?.email ?? "-";
}

function assigneeLabel(task: Task, profiles: Map<string, Profile>) {
  if (task.assignee_id) {
    return profileName(profiles.get(task.assignee_id));
  }

  if (task.owner_id) {
    return profileName(profiles.get(task.owner_id));
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
                  <dt className="font-medium uppercase tracking-wide">
                    Assignee
                  </dt>
                  <dd className="mt-0.5">{assigneeLabel(task, profiles)}</dd>
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

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const supabase = createClient();
  const params = searchParams ?? {};
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: sprints, error: sprintsError },
    { data: profiles },
  ] = await Promise.all([
    supabase
      .from("sprints")
      .select("*")
      .order("start_date", { ascending: false, nullsFirst: false }),
    supabase
      .from("profiles")
      .select("*")
      .order("display_name", { ascending: true }),
  ]);

  if (sprintsError) {
    throw new Error(sprintsError.message);
  }

  const sprintRows = (sprints ?? []) as Sprint[];
  const profileRows = (profiles ?? []) as Profile[];
  const activeSprint = sprintRows.find((sprint) => sprint.status === "Active");
  const selectedSprintId = params.sprint || activeSprint?.id || "";
  const isFallbackBoard = !selectedSprintId;
  const visibleStatuses: TaskStatus[] = isFallbackBoard
    ? TASK_STATUSES.filter((status) => status !== "Done")
    : [...BOARD_STATUSES];

  let tasksQuery = supabase
    .from("tasks")
    .select("*")
    .in("status", visibleStatuses)
    .order("updated_at", { ascending: false });

  if (selectedSprintId) {
    tasksQuery = tasksQuery.eq("sprint_id", selectedSprintId);
  }

  if (params.assignee) {
    tasksQuery = tasksQuery.eq("assignee_id", params.assignee);
  }

  const { data: tasks, error: tasksError } = await tasksQuery;

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const taskRows = (tasks ?? []) as Task[];
  const profileMap = new Map(profileRows.map((profile) => [profile.id, profile]));
  const tasksByStatus = new Map<TaskStatus, Task[]>(
    visibleStatuses.map((status) => [status, []]),
  );

  for (const task of taskRows) {
    if (visibleStatuses.includes(task.status)) {
      tasksByStatus.get(task.status)?.push(task);
    }
  }

  const selectedSprint = selectedSprintId
    ? sprintRows.find((sprint) => sprint.id === selectedSprintId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Board"
        description={
          isFallbackBoard
            ? "No Active sprint is set, so the Board shows all active non-Done work."
            : "Current iteration execution by sprint. Backlog items stay on the Backlog page."
        }
      />
      <SaveNotice saved={params.saved} />

      <form className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Sprint
            </span>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="sprint"
              defaultValue={selectedSprintId}
            >
              <option value="">Active work without sprint filter</option>
              {sprintRows.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Assignee
            </span>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="assignee"
              defaultValue={params.assignee ?? ""}
            >
              <option value="">All</option>
              {profileRows.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profileName(profile)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              type="submit"
            >
              Apply filters
            </button>
            <Link
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
              href="/board"
            >
              Clear
            </Link>
          </div>
        </div>
      </form>

      {selectedSprint ? (
        <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">
                {selectedSprint.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {selectedSprint.goal || "No sprint goal recorded."}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-muted">
              {selectedSprint.status}
            </span>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-ink">
            Active work fallback
          </h2>
          <p className="mt-1 text-sm text-muted">
            No Active sprint is configured. The Board is showing all non-Done
            tasks, including Backlog, so the team can keep working during
            setup or low-process periods.
          </p>
        </section>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-max auto-cols-[18rem] grid-flow-col gap-4">
          {visibleStatuses.map((status) => (
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
