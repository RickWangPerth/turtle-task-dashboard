import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { createClient } from "@/lib/supabase/server";
import { TASK_STATUSES, type TaskStatus } from "@/lib/tasks/constants";
import { formatDateTime } from "@/lib/tasks/format";
import {
  buildExportHref,
  type Profile,
  type Sprint,
  type Task,
} from "@/lib/tasks/query";

function ReportCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function TaskMiniList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) {
    return <p className="text-sm text-muted">No matching tasks.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li className="py-3" key={task.id}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                className="text-sm font-semibold text-ink hover:underline"
                href={`/tasks/${task.id}`}
              >
                {task.task_code} - {task.title}
              </Link>
              <p className="mt-1 text-xs text-muted">{task.epic ?? "-"}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            Updated {formatDateTime(task.updated_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function CountList({ counts }: { counts: Array<[string, number]> }) {
  if (!counts.length) {
    return <p className="text-sm text-muted">No data.</p>;
  }

  return (
    <ul className="divide-y divide-border text-sm">
      {counts.map(([label, count]) => (
        <li className="flex items-center justify-between py-2" key={label}>
          <span className="text-ink">{label || "Unspecified"}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-muted">
            {count}
          </span>
        </li>
      ))}
    </ul>
  );
}

function groupCounts(tasks: Task[], getLabel: (task: Task) => string) {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    const label = getLabel(task);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function profileName(profile: Profile | undefined) {
  return profile?.display_name ?? profile?.email ?? "Unassigned";
}

export default async function ReportsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: taskData, error: tasksError },
    { data: profileData },
    { data: sprintData, error: sprintsError },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase.from("profiles").select("*"),
    supabase.from("sprints").select("*").order("created_at", {
      ascending: false,
    }),
  ]);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  if (sprintsError) {
    throw new Error(sprintsError.message);
  }

  const tasks = (taskData ?? []) as Task[];
  const profiles = (profileData ?? []) as Profile[];
  const sprints = (sprintData ?? []) as Sprint[];
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const activeSprint = sprints.find((sprint) => sprint.status === "Active");
  const activeSprintTasks = activeSprint
    ? tasks.filter((task) => task.sprint_id === activeSprint.id)
    : [];
  const openTasks = tasks.filter((task) => task.status !== "Done");
  const blockedTasks = tasks.filter((task) => task.status === "Blocked");
  const completedTasks = tasks.filter((task) => task.status === "Done");
  const recentlyCompleted = completedTasks.slice(0, 8);

  const statusCounts = TASK_STATUSES.map(
    (status) =>
      [
        status,
        tasks.filter((task) => task.status === status).length,
      ] as [TaskStatus, number],
  );
  const epicCounts = groupCounts(tasks, (task) => task.epic ?? "Unspecified");
  const assigneeCounts = groupCounts(tasks, (task) => {
    const profile = task.assignee_id
      ? profileMap.get(task.assignee_id)
      : task.owner_id
        ? profileMap.get(task.owner_id)
        : undefined;
    return profileName(profile);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Progress visibility generated from tasks, sprints, comments, and status history."
        actions={
          <>
            <Link
              className="rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
              href={buildExportHref("/api/exports/tasks.csv", {})}
            >
              Export all CSV
            </Link>
            <Link
              className="rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
              href={buildExportHref("/api/exports/tasks.json", {})}
            >
              Export all JSON
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total Tasks" value={tasks.length} />
        <MetricCard label="Open Tasks" value={openTasks.length} />
        <MetricCard
          label="Current Sprint Tasks"
          value={activeSprintTasks.length}
        />
        <MetricCard label="Blocked Tasks" value={blockedTasks.length} />
        <MetricCard label="Completed Tasks" value={completedTasks.length} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportCard title="Current Sprint Summary">
          {activeSprint ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-ink">{activeSprint.name}</p>
                <p className="mt-1 text-muted">
                  {activeSprint.goal || "No sprint goal recorded."}
                </p>
              </div>
              <CountList
                counts={TASK_STATUSES.map((status) => [
                  status,
                  activeSprintTasks.filter((task) => task.status === status)
                    .length,
                ])}
              />
            </div>
          ) : (
            <p className="text-sm text-muted">No active sprint.</p>
          )}
        </ReportCard>
        <ReportCard title="Tasks By Status">
          <CountList counts={statusCounts} />
        </ReportCard>
        <ReportCard title="Tasks By Epic">
          <CountList counts={epicCounts} />
        </ReportCard>
        <ReportCard title="Tasks By Assignee">
          <CountList counts={assigneeCounts} />
        </ReportCard>
        <ReportCard title="Blocked Tasks">
          <TaskMiniList tasks={blockedTasks} />
        </ReportCard>
        <ReportCard title="Recently Completed Tasks">
          <TaskMiniList tasks={recentlyCompleted} />
        </ReportCard>
      </div>
    </div>
  );
}
