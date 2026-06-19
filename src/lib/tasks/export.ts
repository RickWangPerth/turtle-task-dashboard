import type { Task } from "@/lib/tasks/query";

const EXPORT_FIELDS: Array<keyof Task> = [
  "task_code",
  "title",
  "epic",
  "priority",
  "status",
  "requester",
  "owner_id",
  "details",
  "decision_needed",
  "acceptance_criteria",
  "client_comment",
  "environment",
  "related_url",
  "screenshot_url",
  "start_date",
  "due_date",
  "uat_date",
  "prod_date",
  "version",
  "commit_url",
  "created_by",
  "created_at",
  "updated_at",
];

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function tasksToCsv(tasks: Task[]) {
  const header = EXPORT_FIELDS.map(csvCell).join(",");
  const rows = tasks.map((task) =>
    EXPORT_FIELDS.map((field) => csvCell(task[field])).join(","),
  );

  return [header, ...rows].join("\n");
}

