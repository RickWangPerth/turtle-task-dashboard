import "server-only";

import { Resend } from "resend";

type TaskCreatedEmailInput = {
  appBaseUrl?: string | null;
  details: string | null;
  id: string;
  priority: string | null;
  requester: string | null;
  taskCode: string;
  title: string;
};

function getTaskUrl(appBaseUrl: string | null | undefined, taskId: string) {
  const baseUrl = appBaseUrl ?? process.env.APP_BASE_URL;

  if (!baseUrl) {
    return null;
  }

  return new URL(`/tasks/${taskId}`, baseUrl).toString();
}

function truncate(text: string | null, maxLength: number) {
  if (!text) {
    return "-";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendTaskCreatedEmail(task: TaskCreatedEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TASK_NOTIFICATION_TO;
  const from = process.env.TASK_NOTIFICATION_FROM;

  if (!apiKey || !to || !from) {
    return;
  }

  const resend = new Resend(apiKey);
  const taskUrl = getTaskUrl(task.appBaseUrl, task.id);
  const subject = `[Turtle Board] New task ${task.taskCode}: ${task.title}`;
  const details = truncate(task.details, 800);
  const htmlTaskCode = escapeHtml(task.taskCode);
  const htmlTitle = escapeHtml(task.title);
  const htmlPriority = escapeHtml(task.priority ?? "-");
  const htmlRequester = escapeHtml(task.requester ?? "-");
  const htmlDetails = escapeHtml(details);
  const htmlTaskUrl = taskUrl ? escapeHtml(taskUrl) : null;
  const text = [
    "A new task was created in Turtle Team Delivery Board.",
    "",
    `Task: ${task.taskCode}`,
    `Title: ${task.title}`,
    `Priority: ${task.priority ?? "-"}`,
    `Requester: ${task.requester ?? "-"}`,
    "",
    "Details:",
    details,
    "",
    taskUrl ? `Open task: ${taskUrl}` : "Open the app to view the task.",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 16px;">New Turtle Board task</h2>
      <p><strong>${htmlTaskCode}</strong>: ${htmlTitle}</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Priority</td><td>${htmlPriority}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Requester</td><td>${htmlRequester}</td></tr>
      </table>
      <h3 style="font-size: 14px; margin: 16px 0 8px;">Details</h3>
      <p style="white-space: pre-wrap;">${htmlDetails}</p>
      ${
        htmlTaskUrl
          ? `<p><a href="${htmlTaskUrl}" style="color: #1d4ed8;">Open task</a></p>`
          : ""
      }
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    html,
    subject,
    text,
    to,
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }
}
