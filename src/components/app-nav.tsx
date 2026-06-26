"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

type AppNavProps = {
  items: NavItem[];
};

export function AppNav({ items }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="inline-flex w-full gap-1 rounded-lg border border-border bg-slate-100 p-1 shadow-inner sm:w-auto"
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "flex-1 rounded-md border border-border bg-white px-5 py-2.5 text-center text-base font-semibold text-ink shadow-sm sm:flex-none"
                : "flex-1 rounded-md px-5 py-2.5 text-center text-base font-semibold text-muted hover:bg-white/70 hover:text-ink sm:flex-none"
            }
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
