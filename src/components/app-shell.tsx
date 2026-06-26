import Link from "next/link";
import { AppNav } from "@/components/app-nav";
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
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
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
          <AppNav items={visibleNavItems} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
