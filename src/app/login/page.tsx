import { redirect } from "next/navigation";
import { requestMagicLink, signInWithPassword } from "./actions";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: {
    message?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/backlog");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            Turtle Research Team
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">
            Turtle Team Delivery Board
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Sign in with a test password locally, or request a magic link.
          </p>
        </div>

        <form action={signInWithPassword} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            type="submit"
          >
            Sign in
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Magic link
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form action={requestMagicLink} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <button
            className="w-full rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
            type="submit"
          >
            Send magic link
          </button>
        </form>

        {searchParams?.message ? (
          <p className="mt-4 rounded-md border border-border bg-slate-50 px-3 py-2 text-sm text-muted">
            {searchParams.message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
