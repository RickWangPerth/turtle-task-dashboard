"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SPRINT_STATUSES, type SprintStatus } from "@/lib/tasks/constants";
import { emptyToNull } from "@/lib/tasks/format";
import type { Database } from "@/lib/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SprintInsert = Database["public"]["Tables"]["sprints"]["Insert"];
type SprintUpdate = Database["public"]["Tables"]["sprints"]["Update"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

const ROLE_VALUES = ["admin", "developer", "team", "viewer"] as const;
type RoleValue = (typeof ROLE_VALUES)[number];

function requireOption<T extends readonly string[]>(
  value: FormDataEntryValue | null,
  options: T,
  fallback: T[number],
) {
  const text = String(value ?? "");
  return options.includes(text) ? (text as T[number]) : fallback;
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const currentProfile = profile as Pick<Profile, "role"> | null;

  if (error || currentProfile?.role !== "admin") {
    redirect("/backlog");
  }

  return supabase;
}

function sprintPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("Iteration name is required.");
  }

  return {
    name,
    goal: emptyToNull(formData.get("goal")),
    start_date: emptyToNull(formData.get("start_date")),
    end_date: emptyToNull(formData.get("end_date")),
    status: requireOption(
      formData.get("status"),
      SPRINT_STATUSES,
      "Planning",
    ) as SprintStatus,
  };
}

async function clearOtherActiveSprints(
  supabase: ReturnType<typeof createClient>,
  sprintId?: string,
) {
  const sprintTable = supabase.from("sprints") as unknown as {
    update: (
      payload: SprintUpdate,
    ) => ReturnType<ReturnType<typeof supabase.from>["update"]>;
  };
  let query = sprintTable.update({ status: "Planning" }).eq(
    "status",
    "Active",
  );

  if (sprintId) {
    query = query.neq("id", sprintId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProfile(profileId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const profileTable = supabase.from("profiles") as unknown as {
    update: (
      payload: ProfileUpdate,
    ) => ReturnType<ReturnType<typeof supabase.from>["update"]>;
  };
  const role = requireOption(
    formData.get("role"),
    ROLE_VALUES,
    "team",
  ) as RoleValue;
  const payload: ProfileUpdate = {
    display_name: emptyToNull(formData.get("display_name")),
    role,
  };

  const { error } = await profileTable
    .update(payload)
    .eq("id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath("/reports");
}

export async function createIteration(formData: FormData) {
  const supabase = await requireAdmin();
  const sprintTable = supabase.from("sprints") as unknown as {
    insert: (
      payload: SprintInsert,
    ) => ReturnType<ReturnType<typeof supabase.from>["insert"]>;
  };
  const payload = sprintPayload(formData);

  if (payload.status === "Active") {
    await clearOtherActiveSprints(supabase);
  }

  const { error } = await sprintTable
    .insert(payload as SprintInsert);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath("/reports");
}

export async function updateIteration(sprintId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const sprintTable = supabase.from("sprints") as unknown as {
    update: (
      payload: SprintUpdate,
    ) => ReturnType<ReturnType<typeof supabase.from>["update"]>;
  };
  const payload = sprintPayload(formData);

  if (payload.status === "Active") {
    await clearOtherActiveSprints(supabase, sprintId);
  }

  const { error } = await sprintTable
    .update(payload as SprintUpdate)
    .eq("id", sprintId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath("/reports");
}

export async function setIterationStatus(
  sprintId: string,
  status: SprintStatus,
) {
  const supabase = await requireAdmin();
  const sprintTable = supabase.from("sprints") as unknown as {
    update: (
      payload: SprintUpdate,
    ) => ReturnType<ReturnType<typeof supabase.from>["update"]>;
  };

  if (status === "Active") {
    await clearOtherActiveSprints(supabase, sprintId);
  }

  const { error } = await sprintTable
    .update({ status } satisfies SprintUpdate)
    .eq("id", sprintId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath("/reports");
}

export async function updateTaskSetup(taskId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const taskTable = supabase.from("tasks") as unknown as {
    update: (
      payload: TaskUpdate,
    ) => ReturnType<ReturnType<typeof supabase.from>["update"]>;
  };
  const payload: TaskUpdate = {
    assignee_id: emptyToNull(formData.get("assignee_id")),
    sprint_id: emptyToNull(formData.get("sprint_id")),
  };

  const { error } = await taskTable
    .update(payload)
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/backlog");
  revalidatePath("/board");
  revalidatePath(`/tasks/${taskId}`);
}
