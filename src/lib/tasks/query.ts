import {
  TASK_ENVIRONMENTS,
  TASK_PRIORITIES,
  TASK_REVIEW_STATUSES,
  TASK_STATUSES,
} from "@/lib/tasks/constants";
import type { Database } from "@/lib/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Sprint = Database["public"]["Tables"]["sprints"]["Row"];

export type TaskFilterParams = {
  assignee?: string;
  environment?: string;
  epic?: string;
  owner?: string;
  priority?: string;
  q?: string;
  review_status?: string;
  sprint?: string;
  status?: string;
};

export function paramsFromSearchParams(
  searchParams: URLSearchParams,
): TaskFilterParams {
  return {
    assignee: searchParams.get("assignee") ?? undefined,
    environment: searchParams.get("environment") ?? undefined,
    epic: searchParams.get("epic") ?? undefined,
    owner: searchParams.get("owner") ?? undefined,
    priority: searchParams.get("priority") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    review_status: searchParams.get("review_status") ?? undefined,
    sprint: searchParams.get("sprint") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  };
}

export function applyTaskFilters<
  T extends {
    eq: (column: string, value: string) => T;
    or: (filters: string) => T;
  },
>(query: T, params: TaskFilterParams) {
  let nextQuery = query;

  if (params.status && TASK_STATUSES.includes(params.status as never)) {
    nextQuery = nextQuery.eq("status", params.status);
  }

  if (params.priority && TASK_PRIORITIES.includes(params.priority as never)) {
    nextQuery = nextQuery.eq("priority", params.priority);
  }

  if (
    params.review_status &&
    TASK_REVIEW_STATUSES.includes(params.review_status as never)
  ) {
    nextQuery = nextQuery.eq("review_status", params.review_status);
  }

  if (params.epic) {
    nextQuery = nextQuery.eq("epic", params.epic);
  }

  if (params.owner) {
    nextQuery = nextQuery.eq("owner_id", params.owner);
  }

  if (params.assignee) {
    nextQuery = nextQuery.eq("assignee_id", params.assignee);
  }

  if (params.sprint) {
    nextQuery = nextQuery.eq("sprint_id", params.sprint);
  }

  if (
    params.environment &&
    TASK_ENVIRONMENTS.includes(params.environment as never)
  ) {
    nextQuery = nextQuery.eq("environment", params.environment);
  }

  if (params.q) {
    const term = params.q.replaceAll(",", " ").trim();
    if (term) {
      nextQuery = nextQuery.or(
        `task_code.ilike.%${term}%,title.ilike.%${term}%,details.ilike.%${term}%`,
      );
    }
  }

  return nextQuery;
}

export function buildExportHref(
  pathname: "/api/exports/tasks.csv" | "/api/exports/tasks.json",
  params: TaskFilterParams,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "saved") {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
