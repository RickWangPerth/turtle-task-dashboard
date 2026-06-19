import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/kanban", label: "Kanban" },
  { href: "/reports", label: "Reports" },
];

type AppShellProps = {
  children: React.ReactNode;
  email: string;
};

export function AppShell({ children, email }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <Link href="/dashboard" className="text-lg font-semibold text-ink">
              Turtle Wishlist Tracker
            </Link>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span>{email}</span>
              <SignOutButton />
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
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
