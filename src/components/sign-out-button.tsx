import { signOut } from "@/app/(app)/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-slate-50"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
