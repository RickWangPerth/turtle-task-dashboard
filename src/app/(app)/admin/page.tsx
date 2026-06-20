import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badges";
import { friendlyRoleLabel, ROLE_LABELS } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { SPRINT_STATUSES } from "@/lib/tasks/constants";
import { formatDateTime } from "@/lib/tasks/format";
import type { Database } from "@/lib/supabase/types";
import {
  createIteration,
  setIterationStatus,
  updateIteration,
  updateProfile,
  updateTaskSetup,
} from "./actions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Sprint = Database["public"]["Tables"]["sprints"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

const roleEntries = Object.entries(ROLE_LABELS) as Array<
  [Profile["role"], string]
>;

function profileName(profile: Profile | undefined) {
  return profile?.display_name ?? profile?.email ?? "-";
}

function Section({
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

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const currentUserProfile = currentProfile as Pick<Profile, "role"> | null;

  if (currentUserProfile?.role !== "admin") {
    redirect("/backlog");
  }

  const [
    { data: profiles, error: profilesError },
    { data: sprints, error: sprintsError },
    { data: setupTasks, error: tasksError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("sprints")
      .select("*")
      .order("start_date", { ascending: false, nullsFirst: false }),
    supabase
      .from("tasks")
      .select("*")
      .or("assignee_id.is.null,sprint_id.is.null")
      .neq("status", "Done")
      .order("updated_at", { ascending: false }),
  ]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  if (sprintsError) {
    throw new Error(sprintsError.message);
  }

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const profileRows = (profiles ?? []) as Profile[];
  const sprintRows = (sprints ?? []) as Sprint[];
  const taskRows = (setupTasks ?? []) as Task[];
  const profileById = new Map(profileRows.map((profile) => [profile.id, profile]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        description="Small-team setup for users, iterations, and task assignment."
      />

      <Section title="Users">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Display name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profileRows.map((profile) => (
                <tr key={profile.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {profile.email ?? "-"}
                  </td>
                  <td className="min-w-56 px-4 py-3">
                    <form
                      action={updateProfile.bind(null, profile.id)}
                      className="flex min-w-[32rem] items-center gap-3"
                    >
                      <input
                        className={inputClass}
                        defaultValue={profile.display_name ?? ""}
                        name="display_name"
                      />
                      <select
                        className={inputClass}
                        defaultValue={profile.role}
                        name="role"
                      >
                        {roleEntries.map(([role, label]) => (
                          <option key={role} value={role}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                        type="submit"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {friendlyRoleLabel(profile.role)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDateTime(profile.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    Profile only
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Iterations">
        <form
          action={createIteration}
          className="mb-6 grid gap-4 rounded-lg border border-border bg-slate-50 p-4 md:grid-cols-6"
        >
          <label className="block md:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Name
            </span>
            <input className={`${inputClass} mt-2`} name="name" required />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Goal
            </span>
            <input className={`${inputClass} mt-2`} name="goal" />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Start
            </span>
            <input className={`${inputClass} mt-2`} name="start_date" type="date" />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              End
            </span>
            <input className={`${inputClass} mt-2`} name="end_date" type="date" />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Status
            </span>
            <select
              className={`${inputClass} mt-2`}
              defaultValue="Planning"
              name="status"
            >
              {SPRINT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              type="submit"
            >
              Create
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {sprintRows.length ? (
            sprintRows.map((sprint) => (
              <form
                action={updateIteration.bind(null, sprint.id)}
                className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-7"
                key={sprint.id}
              >
                <input
                  className={`${inputClass} md:col-span-2`}
                  defaultValue={sprint.name}
                  name="name"
                  required
                />
                <input
                  className={`${inputClass} md:col-span-2`}
                  defaultValue={sprint.goal ?? ""}
                  name="goal"
                />
                <input
                  className={inputClass}
                  defaultValue={dateInputValue(sprint.start_date)}
                  name="start_date"
                  type="date"
                />
                <input
                  className={inputClass}
                  defaultValue={dateInputValue(sprint.end_date)}
                  name="end_date"
                  type="date"
                />
                <select
                  className={inputClass}
                  defaultValue={sprint.status}
                  name="status"
                >
                  {SPRINT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 md:col-span-7">
                  <button
                    className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                    type="submit"
                  >
                    Save iteration
                  </button>
                  <button
                    className="rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-slate-50"
                    formAction={setIterationStatus.bind(null, sprint.id, "Active")}
                    type="submit"
                  >
                    Set Active
                  </button>
                  <button
                    className="rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-slate-50"
                    formAction={setIterationStatus.bind(
                      null,
                      sprint.id,
                      "Completed",
                    )}
                    type="submit"
                  >
                    Mark Completed
                  </button>
                  <span className="rounded-md bg-slate-100 px-2 py-2 text-xs font-medium text-muted">
                    {sprint.status}
                  </span>
                </div>
              </form>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
              No iterations yet.
            </p>
          )}
        </div>
      </Section>

      <Section title="Task Setup Helper">
        {taskRows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Iteration</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {taskRows.map((task) => (
                  <tr key={task.id}>
                    <td className="min-w-72 px-4 py-3">
                      <Link
                        className="font-medium text-ink hover:underline"
                        href={`/tasks/${task.id}`}
                      >
                        {task.task_code} - {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {task.assignee_id
                        ? profileName(profileById.get(task.assignee_id))
                        : "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {task.sprint_id
                        ? sprintRows.find((sprint) => sprint.id === task.sprint_id)
                            ?.name ?? "-"
                        : "No iteration"}
                    </td>
                    <td className="min-w-[28rem] px-4 py-3">
                      <form
                        action={updateTaskSetup.bind(null, task.id)}
                        className="flex items-center gap-2"
                      >
                        <select
                          className={inputClass}
                          defaultValue={task.assignee_id ?? ""}
                          name="assignee_id"
                        >
                          <option value="">Unassigned</option>
                          {profileRows.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                              {profileName(profile)}
                            </option>
                          ))}
                        </select>
                        <select
                          className={inputClass}
                          defaultValue={task.sprint_id ?? ""}
                          name="sprint_id"
                        >
                          <option value="">No iteration</option>
                          {sprintRows.map((sprint) => (
                            <option key={sprint.id} value={sprint.id}>
                              {sprint.name}
                            </option>
                          ))}
                        </select>
                        <button
                          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                          type="submit"
                        >
                          Assign
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
            All active tasks have assignee and iteration values.
          </p>
        )}
      </Section>
    </div>
  );
}
