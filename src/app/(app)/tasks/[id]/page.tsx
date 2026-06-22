import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SaveNotice } from "@/components/save-notice";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { canSeeDeliveryFields } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { TASK_STATUSES } from "@/lib/tasks/constants";
import { formatDate, formatDateTime } from "@/lib/tasks/format";
import { createTaskComment, updateTaskStatus } from "../actions";
import type { Database } from "@/lib/supabase/types";

type TaskDetailPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    saved?: string;
  };
};

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskComment = Database["public"]["Tables"]["task_comments"]["Row"];
type StatusHistory =
  Database["public"]["Tables"]["task_status_history"]["Row"];
type Sprint = Database["public"]["Tables"]["sprints"]["Row"];

function profileName(profile: Profile | null | undefined) {
  return profile?.display_name ?? profile?.email ?? "-";
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink">{value || "-"}</dd>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-ink">{label}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">
        {value || "-"}
      </p>
    </section>
  );
}

function StatusQuickUpdate({
  status,
  taskId,
}: {
  status: Task["status"];
  taskId: string;
}) {
  return (
    <form
      action={updateTaskStatus.bind(null, taskId)}
      className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-end"
    >
      <label className="block flex-1">
        <span className="text-sm font-medium text-ink">Quick status update</span>
        <select
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          defaultValue={status}
          name="status"
        >
          {TASK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <button
        className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        type="submit"
      >
        Update status
      </button>
    </form>
  );
}

function CommentForm({ taskId }: { taskId: string }) {
  return (
    <form action={createTaskComment.bind(null, taskId)} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-ink">Add comment</span>
        <textarea
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          name="body"
          required
          rows={4}
        />
      </label>
      <div className="flex justify-end">
        <button
          className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          type="submit"
        >
          Add comment
        </button>
      </div>
    </form>
  );
}

function ActivitySection({
  comments,
  histories,
  profiles,
  taskId,
}: {
  comments: TaskComment[];
  histories: StatusHistory[];
  profiles: Map<string, Profile>;
  taskId: string;
}) {
  const activityItems = [
    ...comments.map((comment) => ({
      id: `comment-${comment.id}`,
      at: comment.created_at,
      node: (
        <article className="rounded-lg border border-border bg-white p-4">
          <div className="flex flex-col justify-between gap-1 sm:flex-row">
            <p className="text-sm font-medium text-ink">
              {profileName(
                comment.author_id ? profiles.get(comment.author_id) : null,
              )}
            </p>
            <time className="text-xs text-muted">
              {formatDateTime(comment.created_at)}
            </time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">
            {comment.body}
          </p>
        </article>
      ),
    })),
    ...histories.map((history) => ({
      id: `history-${history.id}`,
      at: history.changed_at,
      node: (
        <article className="rounded-lg border border-border bg-slate-50 p-4">
          <div className="flex flex-col justify-between gap-1 sm:flex-row">
            <p className="text-sm font-medium text-ink">
              Status changed from {history.from_status ?? "-"} to{" "}
              {history.to_status ?? "-"}
            </p>
            <time className="text-xs text-muted">
              {formatDateTime(history.changed_at)}
            </time>
          </div>
          <p className="mt-2 text-sm text-muted">
            Changed by{" "}
            {profileName(
              history.changed_by ? profiles.get(history.changed_by) : null,
            )}
          </p>
        </article>
      ),
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div>
          <h2 className="text-base font-semibold text-ink">Activity</h2>
          <div className="mt-4 space-y-3">
            {activityItems.length ? (
              activityItems.map((item) => <div key={item.id}>{item.node}</div>)
            ) : (
              <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
                No comments or status changes yet.
              </p>
            )}
          </div>
        </div>
        <div>
          <CommentForm taskId={taskId} />
        </div>
      </div>
    </section>
  );
}

export default async function TaskDetailPage({
  params,
  searchParams,
}: TaskDetailPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !task) {
    notFound();
  }

  const currentTask = task as Task;

  const [
    { data: owner },
    { data: assignee },
    { data: sprint },
    { data: creator },
    { data: comments },
    { data: histories },
    { data: profiles },
    { data: currentProfile },
  ] = await Promise.all([
    currentTask.owner_id
      ? supabase
          .from("profiles")
          .select("*")
          .eq("id", currentTask.owner_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    currentTask.assignee_id
      ? supabase
          .from("profiles")
          .select("*")
          .eq("id", currentTask.assignee_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    currentTask.sprint_id
      ? supabase
          .from("sprints")
          .select("*")
          .eq("id", currentTask.sprint_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    currentTask.created_by
      ? supabase
          .from("profiles")
          .select("*")
          .eq("id", currentTask.created_by)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("task_comments")
      .select("*")
      .eq("task_id", currentTask.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_status_history")
      .select("*")
      .eq("task_id", currentTask.id)
      .order("changed_at", { ascending: false }),
    supabase.from("profiles").select("*"),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const profileMap = new Map(
    ((profiles ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );
  const role = (currentProfile as Pick<Profile, "role"> | null)?.role ?? null;
  const showDeliveryFields = canSeeDeliveryFields(role);
  const canUpdateStatus = role === "admin" || role === "developer" || role === "team";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${currentTask.task_code} - ${currentTask.title}`}
        description="Task detail is the source of truth for this item."
        actions={
          <>
            <Link
              className="rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
              href="/backlog"
            >
              Back to backlog
            </Link>
            <Link
              className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              href={`/tasks/${currentTask.id}/edit`}
            >
              Edit task
            </Link>
          </>
        }
      />
      <SaveNotice saved={searchParams?.saved} />

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={currentTask.priority} />
          <StatusBadge status={currentTask.status} />
          {showDeliveryFields ? (
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
              {currentTask.environment}
            </span>
          ) : null}
        </div>
        <dl className="mt-6 grid gap-5 md:grid-cols-3">
          {showDeliveryFields ? (
            <DetailItem label="Epic" value={currentTask.epic} />
          ) : null}
          <DetailItem label="Requester" value={currentTask.requester} />
          {showDeliveryFields ? (
            <>
              <DetailItem
                label="Assignee"
                value={profileName((assignee as Profile | null) ?? owner)}
              />
              <DetailItem
                label="Sprint"
                value={(sprint as Sprint | null)?.name ?? "-"}
              />
              <DetailItem label="Owner" value={profileName(owner)} />
            </>
          ) : null}
          <DetailItem label="Created by" value={profileName(creator)} />
          <DetailItem
            label="Created"
            value={formatDateTime(currentTask.created_at)}
          />
          <DetailItem
            label="Updated"
            value={formatDateTime(currentTask.updated_at)}
          />
          <DetailItem
            label="Start date"
            value={formatDate(currentTask.start_date)}
          />
          <DetailItem label="Due date" value={formatDate(currentTask.due_date)} />
          {showDeliveryFields ? (
            <>
              <DetailItem
                label="UAT date"
                value={formatDate(currentTask.uat_date)}
              />
              <DetailItem
                label="PROD date"
                value={formatDate(currentTask.prod_date)}
              />
              <DetailItem label="Version" value={currentTask.version} />
              <DetailItem
                label="Commit URL"
                value={
                  currentTask.commit_url ? (
                    <a
                      className="text-blue-700 underline"
                      href={currentTask.commit_url}
                    >
                      {currentTask.commit_url}
                    </a>
                  ) : (
                    "-"
                  )
                }
              />
            </>
          ) : null}
          <DetailItem
            label="Related URL"
            value={
              currentTask.related_url ? (
                <a
                  className="text-blue-700 underline"
                  href={currentTask.related_url}
                >
                  {currentTask.related_url}
                </a>
              ) : (
                "-"
              )
            }
          />
          <DetailItem
            label="Screenshot URL"
            value={
              currentTask.screenshot_url ? (
                <a
                  className="text-blue-700 underline"
                  href={currentTask.screenshot_url}
                >
                  {currentTask.screenshot_url}
                </a>
              ) : (
                "-"
              )
            }
          />
        </dl>
      </section>

      {canUpdateStatus ? (
        <StatusQuickUpdate status={currentTask.status} taskId={currentTask.id} />
      ) : null}

      <TextBlock label="Details" value={currentTask.details} />
      <TextBlock label="Decision needed" value={currentTask.decision_needed} />
      <TextBlock
        label="Acceptance criteria"
        value={currentTask.acceptance_criteria}
      />
      {showDeliveryFields ? (
        <>
          <TextBlock
            label="Implementation Plan"
            value={currentTask.implementation_plan}
          />
          <TextBlock
            label="Completion Notes"
            value={currentTask.completion_notes}
          />
        </>
      ) : null}

      <ActivitySection
        comments={(comments ?? []) as TaskComment[]}
        histories={(histories ?? []) as StatusHistory[]}
        profiles={profileMap}
        taskId={currentTask.id}
      />
    </div>
  );
}
