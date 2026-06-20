"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  TASK_ENVIRONMENTS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskEnvironment,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks/constants";
import { emptyToNull } from "@/lib/tasks/format";
import type { Database } from "@/lib/supabase/types";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
type TaskCommentInsert =
  Database["public"]["Tables"]["task_comments"]["Insert"];

function requireOption<T extends readonly string[]>(
  value: FormDataEntryValue | null,
  options: T,
  fallback: T[number],
) {
  const text = String(value ?? "");
  return options.includes(text) ? (text as T[number]) : fallback;
}

function getTaskPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    throw new Error("Task title is required.");
  }

  return {
    title,
    epic: emptyToNull(formData.get("epic")),
    priority: requireOption(
      formData.get("priority"),
      TASK_PRIORITIES,
      "P2",
    ) as TaskPriority,
    status: requireOption(
      formData.get("status"),
      TASK_STATUSES,
      "Backlog",
    ) as TaskStatus,
    requester: emptyToNull(formData.get("requester")),
    owner_id: emptyToNull(formData.get("owner_id")),
    assignee_id: emptyToNull(formData.get("assignee_id")),
    sprint_id: emptyToNull(formData.get("sprint_id")),
    details: emptyToNull(formData.get("details")),
    decision_needed: emptyToNull(formData.get("decision_needed")),
    acceptance_criteria: emptyToNull(formData.get("acceptance_criteria")),
    client_comment: emptyToNull(formData.get("client_comment")),
    environment: requireOption(
      formData.get("environment"),
      TASK_ENVIRONMENTS,
      "NA",
    ) as TaskEnvironment,
    related_url: emptyToNull(formData.get("related_url")),
    screenshot_url: emptyToNull(formData.get("screenshot_url")),
    start_date: emptyToNull(formData.get("start_date")),
    due_date: emptyToNull(formData.get("due_date")),
    uat_date: emptyToNull(formData.get("uat_date")),
    prod_date: emptyToNull(formData.get("prod_date")),
    version: emptyToNull(formData.get("version")),
    commit_url: emptyToNull(formData.get("commit_url")),
  };
}

export async function createTask(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const payload = {
    ...getTaskPayload(formData),
    created_by: user.id,
  };

  const taskTable = supabase.from("tasks") as unknown as {
    insert: (
      payload: TaskInsert,
    ) => ReturnType<ReturnType<typeof supabase.from>["insert"]>;
  };

  const { data, error } = await taskTable
    .insert(payload as TaskInsert)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath("/reports");
  redirect(`/tasks/${data.id}`);
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = createClient();
  const payload = getTaskPayload(formData);

  const taskTable = supabase.from("tasks") as unknown as {
    update: (
      payload: TaskUpdate,
    ) => ReturnType<ReturnType<typeof supabase.from>["update"]>;
  };

  const { error } = await taskTable
    .update(payload as TaskUpdate)
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath("/reports");
  revalidatePath(`/tasks/${taskId}`);
  redirect(`/tasks/${taskId}`);
}

export async function createTaskComment(taskId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const payload: TaskCommentInsert = {
    task_id: taskId,
    author_id: user.id,
    body,
  };

  const commentTable = supabase.from("task_comments") as unknown as {
    insert: (
      payload: TaskCommentInsert,
    ) => ReturnType<ReturnType<typeof supabase.from>["insert"]>;
  };

  const { error } = await commentTable.insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/tasks/${taskId}`);
}

export async function updateTaskStatus(taskId: string, formData: FormData) {
  const status = requireOption(
    formData.get("status"),
    TASK_STATUSES,
    "Backlog",
  ) as TaskStatus;

  const supabase = createClient();
  const taskTable = supabase.from("tasks") as unknown as {
    update: (
      payload: TaskUpdate,
    ) => ReturnType<ReturnType<typeof supabase.from>["update"]>;
  };

  const { error } = await taskTable.update({ status }).eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath("/reports");
  revalidatePath(`/tasks/${taskId}`);
}
