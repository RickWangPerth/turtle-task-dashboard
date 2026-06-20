import type { TaskPriority, TaskStatus } from "@/lib/tasks/constants";

const priorityStyles: Record<TaskPriority, string> = {
  P1: "border-red-200 bg-red-50 text-red-700",
  P2: "border-amber-200 bg-amber-50 text-amber-800",
  P3: "border-slate-200 bg-slate-50 text-slate-700",
};

const statusStyles: Record<TaskStatus, string> = {
  Backlog: "border-slate-200 bg-slate-50 text-slate-700",
  Ready: "border-sky-200 bg-sky-50 text-sky-800",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-800",
  "Review/UAT": "border-violet-200 bg-violet-50 text-violet-800",
  Blocked: "border-orange-200 bg-orange-50 text-orange-800",
  Done: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={priorityStyles[priority]}>{priority}</Badge>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={statusStyles[status]}>{status}</Badge>;
}
