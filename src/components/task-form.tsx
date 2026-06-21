import {
  TASK_ENVIRONMENTS,
  TASK_EPICS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/lib/tasks/constants";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Sprint = Database["public"]["Tables"]["sprints"]["Row"];

type TaskFormProps = {
  action: (formData: FormData) => void;
  profiles: Profile[];
  sprints?: Sprint[];
  task?: Task;
  submitLabel: string;
};

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export function TaskForm({
  action,
  profiles,
  sprints = [],
  task,
  submitLabel,
}: TaskFormProps) {
  return (
    <form action={action} className="space-y-8">
      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Task Summary</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Title">
              <input
                className={inputClass}
                name="title"
                required
                defaultValue={task?.title ?? ""}
              />
            </Field>
          </div>
          <Field label="Epic">
            <input
              className={inputClass}
              name="epic"
              list="epic-options"
              defaultValue={task?.epic ?? ""}
            />
          </Field>
          <Field label="Priority">
            <select
              className={inputClass}
              name="priority"
              defaultValue={task?.priority ?? "P2"}
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              name="status"
              defaultValue={task?.status ?? "Backlog"}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Environment">
            <select
              className={inputClass}
              name="environment"
              defaultValue={task?.environment ?? "NA"}
            >
              {TASK_ENVIRONMENTS.map((environment) => (
                <option key={environment} value={environment}>
                  {environment}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Request Details</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Requester">
            <input
              className={inputClass}
              name="requester"
              defaultValue={task?.requester ?? ""}
            />
          </Field>
          <Field label="Assignee">
            <select
              className={inputClass}
              name="assignee_id"
              defaultValue={task?.assignee_id ?? task?.owner_id ?? ""}
            >
              <option value="">Unassigned</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.display_name ?? profile.email ?? profile.id}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sprint">
            <select
              className={inputClass}
              name="sprint_id"
              defaultValue={task?.sprint_id ?? ""}
            >
              <option value="">No sprint</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
            </select>
          </Field>
          <input name="owner_id" type="hidden" value={task?.owner_id ?? ""} />
          <div className="md:col-span-2">
            <Field label="Details">
              <textarea
                className={inputClass}
                name="details"
                rows={5}
                defaultValue={task?.details ?? ""}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Client comment">
              <textarea
                className={inputClass}
                name="client_comment"
                rows={3}
                defaultValue={task?.client_comment ?? ""}
              />
            </Field>
          </div>
          <Field label="Related URL">
            <input
              className={inputClass}
              name="related_url"
              type="url"
              defaultValue={task?.related_url ?? ""}
            />
          </Field>
          <Field label="Screenshot URL">
            <input
              className={inputClass}
              name="screenshot_url"
              type="url"
              defaultValue={task?.screenshot_url ?? ""}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Decision And Delivery</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Decision needed">
              <textarea
                className={inputClass}
                name="decision_needed"
                rows={3}
                defaultValue={task?.decision_needed ?? ""}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Acceptance criteria">
              <textarea
                className={inputClass}
                name="acceptance_criteria"
                rows={3}
                defaultValue={task?.acceptance_criteria ?? ""}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Implementation plan">
              <textarea
                className={inputClass}
                name="implementation_plan"
                rows={6}
                defaultValue={task?.implementation_plan ?? ""}
                placeholder={
                  "1. Update database schema\n2. Add validation logic\n3. Update export query\n4. UAT with Turtle team\n5. Deploy to PROD"
                }
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Completion notes">
              <textarea
                className={inputClass}
                name="completion_notes"
                rows={6}
                defaultValue={task?.completion_notes ?? ""}
                placeholder={
                  "Implemented:\n- Added new tag state\n\nTested:\n- UAT completed with Turtle team\n\nReleased:\n- PROD version 2.0.15"
                }
              />
            </Field>
          </div>
          <Field label="Start date">
            <input
              className={inputClass}
              name="start_date"
              type="date"
              defaultValue={dateValue(task?.start_date)}
            />
          </Field>
          <Field label="Due date">
            <input
              className={inputClass}
              name="due_date"
              type="date"
              defaultValue={dateValue(task?.due_date)}
            />
          </Field>
          <Field label="UAT date">
            <input
              className={inputClass}
              name="uat_date"
              type="date"
              defaultValue={dateValue(task?.uat_date)}
            />
          </Field>
          <Field label="PROD date">
            <input
              className={inputClass}
              name="prod_date"
              type="date"
              defaultValue={dateValue(task?.prod_date)}
            />
          </Field>
          <Field label="Version">
            <input
              className={inputClass}
              name="version"
              defaultValue={task?.version ?? ""}
            />
          </Field>
          <Field label="Commit URL">
            <input
              className={inputClass}
              name="commit_url"
              type="url"
              defaultValue={task?.commit_url ?? ""}
            />
          </Field>
        </div>
      </section>

      <datalist id="epic-options">
        {TASK_EPICS.map((epic) => (
          <option key={epic} value={epic} />
        ))}
      </datalist>

      <div className="flex justify-end gap-3">
        <button
          className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
