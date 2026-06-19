import { createClient } from "@/lib/supabase/server";
import { tasksToCsv } from "@/lib/tasks/export";
import {
  applyTaskFilters,
  paramsFromSearchParams,
  type Task,
} from "@/lib/tasks/query";

export async function GET(request: Request) {
  const supabase = createClient();
  const url = new URL(request.url);
  const params = paramsFromSearchParams(url.searchParams);
  const query = applyTaskFilters(
    supabase.from("tasks").select("*").order("updated_at", { ascending: false }),
    params,
  );
  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const csv = tasksToCsv((data ?? []) as Task[]);
  const isInline = url.searchParams.get("inline") === "1";
  const headers = new Headers({
    "Content-Type": isInline
      ? "text/plain; charset=utf-8"
      : "text/csv; charset=utf-8",
  });

  if (!isInline) {
    headers.set("Content-Disposition", 'attachment; filename="turtle-tasks.csv"');
  }

  return new Response(csv, { headers });
}
