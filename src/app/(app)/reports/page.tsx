import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { createClient } from "@/lib/supabase/server";
import { TASK_STATUSES, type TaskStatus } from "@/lib/tasks/constants";
import { formatDateTime } from "@/lib/tasks/format";
import { buildExportHref, type Task } from "@/lib/tasks/query";

const openStatuses = new Set([
  "To Do",
  "Info Needed",
  "In Progress",
  "Under Test",
  "Done",
  "Go Prod",
]);

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

function groupCounts(tasks: Task[], key: keyof Task) {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    const label = String(task[key] ?? "Unspecified");
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default async function ReportsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const tasks = (data ?? []) as Task[];
  const openP1P2 = tasks.filter(
    (task) =>
      (task.priority === "P1" || task.priority === "P2") &&
      openStatuses.has(task.status),
  );
  const infoNeeded = tasks.filter((task) => task.status === "Info Needed");
  const underTest = tasks.filter((task) => task.status === "Under Test");
  const goProd = tasks.filter((task) => task.status === "Go Prod");
  const recentlyCompleted = tasks
    .filter((task) => task.status === "Done" || task.status === "Closed")
    .slice(0, 8);

  const statusCounts = TASK_STATUSES.map(
    (status) =>
      [
        status,
        tasks.filter((task) => task.status === status).length,
      ] as [TaskStatus, number],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Simple project summaries generated directly from current task records."
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

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportCard title="Open P1/P2 Tasks">
          <TaskMiniList tasks={openP1P2} />
        </ReportCard>
        <ReportCard title="Info Needed Tasks">
          <TaskMiniList tasks={infoNeeded} />
        </ReportCard>
        <ReportCard title="Under Test Tasks">
          <TaskMiniList tasks={underTest} />
        </ReportCard>
        <ReportCard title="Go Prod Tasks">
          <TaskMiniList tasks={goProd} />
        </ReportCard>
        <ReportCard title="Recently Completed Tasks">
          <TaskMiniList tasks={recentlyCompleted} />
        </ReportCard>
        <ReportCard title="Tasks Grouped By Epic">
          <CountList counts={groupCounts(tasks, "epic")} />
        </ReportCard>
        <ReportCard title="Tasks Grouped By Status">
          <CountList counts={statusCounts} />
        </ReportCard>
      </div>
    </div>
  );
}
