import { createClient } from "@/lib/supabase/server";
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

  return Response.json({
    exported_at: new Date().toISOString(),
    filters: params,
    tasks: (data ?? []) as Task[],
  });
}
