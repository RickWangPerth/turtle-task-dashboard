export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
      {message}
    </div>
  );
}

