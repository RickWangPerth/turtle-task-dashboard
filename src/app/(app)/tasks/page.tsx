import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { createClient } from "@/lib/supabase/server";
import {
  TASK_ENVIRONMENTS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/lib/tasks/constants";
import { formatDate, formatDateTime } from "@/lib/tasks/format";
import {
  applyTaskFilters,
  buildExportHref,
  type Profile,
  type Task,
} from "@/lib/tasks/query";

type TasksPageProps = {
  searchParams?: {
    status?: string;
    priority?: string;
    epic?: string;
    owner?: string;
    environment?: string;
    q?: string;
  };
};

function profileName(profile: Profile | undefined) {
  return profile?.display_name ?? profile?.email ?? "-";
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const supabase = createClient();
  const params = searchParams ?? {};

  let query = supabase
    .from("tasks")
    .select("*")
    .order("updated_at", { ascending: false });

  query = applyTaskFilters(query, params);

  const [{ data: tasks, error: tasksError }, { data: profiles }] =
    await Promise.all([
      query,
      supabase
        .from("profiles")
        .select("*")
        .order("display_name", { ascending: true }),
    ]);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const taskRows = (tasks ?? []) as Task[];
  const profileRows = (profiles ?? []) as Profile[];
  const profileById = new Map(profileRows.map((item) => [item.id, item]));
  const epics = Array.from(
    new Set(
      taskRows
        .map((task) => task.epic)
        .filter((epic): epic is string => Boolean(epic)),
    ),
  ).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Filter and open live task records from Supabase."
        actions={
          <>
            <Link
              className="rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
              href={buildExportHref("/api/exports/tasks.csv", params)}
            >
              Export CSV
            </Link>
            <Link
              className="rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
              href={buildExportHref("/api/exports/tasks.json", params)}
            >
              Export JSON
            </Link>
            <Link
              className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              href="/tasks/new"
            >
              New task
            </Link>
          </>
        }
      />

      <form className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Search
            </span>
            <input
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Title, details, code"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Status
            </span>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="status"
              defaultValue={params.status ?? ""}
            >
              <option value="">All</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Priority
            </span>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="priority"
              defaultValue={params.priority ?? ""}
            >
              <option value="">All</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Epic
            </span>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="epic"
              defaultValue={params.epic ?? ""}
            >
              <option value="">All</option>
              {epics.map((epic) => (
                <option key={epic} value={epic}>
                  {epic}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Owner
            </span>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="owner"
              defaultValue={params.owner ?? ""}
            >
              <option value="">All</option>
              {profileRows.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profileName(profile)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Environment
            </span>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              name="environment"
              defaultValue={params.environment ?? ""}
            >
              <option value="">All</option>
              {TASK_ENVIRONMENTS.map((environment) => (
                <option key={environment} value={environment}>
                  {environment}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            type="submit"
          >
            Apply filters
          </button>
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
            href="/tasks"
          >
            Clear
          </Link>
        </div>
      </form>

      {taskRows.length ? (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Epic</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {taskRows.map((task) => (
                  <tr className="hover:bg-slate-50" key={task.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                      <Link href={`/tasks/${task.id}`}>{task.task_code}</Link>
                    </td>
                    <td className="min-w-72 px-4 py-3">
                      <Link
                        className="font-medium text-ink hover:underline"
                        href={`/tasks/${task.id}`}
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{task.epic ?? "-"}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {task.requester ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {profileName(
                        task.owner_id ? profileById.get(task.owner_id) : undefined,
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {task.environment}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {formatDate(task.due_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {formatDateTime(task.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState message="No tasks match the current filters." />
      )}
    </div>
  );
}
