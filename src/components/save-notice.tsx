const messages: Record<string, string> = {
  admin: "Admin changes saved.",
  comment: "Comment added.",
  created: "Task created.",
  iteration: "Iteration saved.",
  profile: "User profile saved.",
  review: "Review status updated.",
  status: "Status updated.",
  task: "Task saved.",
  task_setup: "Task setup saved.",
};

export function SaveNotice({ saved }: { saved?: string }) {
  if (!saved) {
    return null;
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
      {messages[saved] ?? "Changes saved."}
    </div>
  );
}
