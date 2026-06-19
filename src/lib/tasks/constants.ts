export const TASK_STATUSES = [
  "To Do",
  "Info Needed",
  "In Progress",
  "Under Test",
  "Done",
  "Go Prod",
  "Closed",
] as const;

export const TASK_PRIORITIES = ["P1", "P2", "P3"] as const;

export const TASK_ENVIRONMENTS = ["NA", "Local", "UAT", "PROD"] as const;

export const TASK_EPICS = [
  "Data Entry Interface",
  "Data Entry Validation",
  "Bugs",
  "QA/QC Page",
  "Database Backend",
  "Security / Access",
  "Data Downloads",
  "General",
  "ODK",
  "Reporting",
  "Curation",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskEnvironment = (typeof TASK_ENVIRONMENTS)[number];

