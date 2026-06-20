import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { friendlyRoleLabel } from "@/lib/roles";

const navItems = [
  { href: "/backlog", label: "Backlog" },
  { href: "/board", label: "Board" },
  { href: "/reports", label: "Reports" },
];

type AppShellProps = {
  children: React.ReactNode;
  email: string;
  role?: string | null;
};

export function AppShell({ children, email, role }: AppShellProps) {
  const roleLabel = friendlyRoleLabel(role);
  const visibleNavItems =
    role === "admin" ? [...navItems, { href: "/admin", label: "Admin" }] : navItems;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <Link href="/backlog" className="text-lg font-semibold text-ink">
              Turtle Team Delivery Board
            </Link>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span>{email}</span>
              {roleLabel ? (
                <span className="rounded-md border border-border bg-slate-50 px-2 py-1 text-xs font-medium text-muted">
                  {roleLabel}
                </span>
              ) : null}
              <SignOutButton />
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {visibleNavItems.map((item) => (
              <Link
                className="rounded-md px-3 py-2 text-muted hover:bg-slate-100 hover:text-ink"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
