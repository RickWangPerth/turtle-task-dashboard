import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, priority, status, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const allTasks = (tasks ?? []) as Task[];
  const openStatuses = new Set([
    "To Do",
    "Info Needed",
    "In Progress",
    "Under Test",
    "Done",
    "Go Prod",
  ]);

  const cards = [
    {
      label: "Total tasks",
      value: allTasks.length,
    },
    {
      label: "P1 open tasks",
      value: allTasks.filter(
        (task) => task.priority === "P1" && openStatuses.has(task.status),
      ).length,
    },
    {
      label: "In Progress",
      value: allTasks.filter((task) => task.status === "In Progress").length,
    },
    {
      label: "Under Test",
      value: allTasks.filter((task) => task.status === "Under Test").length,
    },
    {
      label: "Go Prod",
      value: allTasks.filter((task) => task.status === "Go Prod").length,
    },
    {
      label: "Info Needed",
      value: allTasks.filter((task) => task.status === "Info Needed").length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live summary of current Turtle Wishlist tasks."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            className="rounded-lg border border-border bg-white p-5 shadow-sm"
            key={card.label}
          >
            <p className="text-sm font-medium text-muted">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {card.value}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
