export const TASK_STATUSES = [
  "Backlog",
  "To Do",
  "In Progress",
  "Review/UAT",
  "Blocked",
  "Done",
] as const;

export const BOARD_STATUSES = [
  "To Do",
  "In Progress",
  "Review/UAT",
  "Blocked",
  "Done",
] as const;

export const TASK_PRIORITIES = ["P1", "P2", "P3"] as const;

export const TASK_ENVIRONMENTS = ["NA", "Local", "UAT", "PROD"] as const;

export const SPRINT_STATUSES = ["Planning", "Active", "Completed"] as const;

export const TASK_REVIEW_STATUSES = [
  "Needs Review",
  "Reviewed",
  "Needs More Info",
  "Rejected",
  "Duplicate",
] as const;

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
export type BoardStatus = (typeof BOARD_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskEnvironment = (typeof TASK_ENVIRONMENTS)[number];
export type SprintStatus = (typeof SPRINT_STATUSES)[number];
export type TaskReviewStatus = (typeof TASK_REVIEW_STATUSES)[number];
