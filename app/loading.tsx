export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f5f5]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-black/10 border-t-[var(--primary)]" />
        <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Loading
        </p>
      </div>
    </div>
  );
}
