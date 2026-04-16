export default function ActivityLogPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">Activity log</h1>
      <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
        Team and case events will be listed here for audit and review. Case
        updates you make today are stored in this browser until a server-backed
        activity feed is connected.
      </p>
    </div>
  );
}
