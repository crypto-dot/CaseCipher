import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="px-3 pb-6 sm:px-4">
      <div className="mx-auto container flex flex-col gap-4 rounded-3xl bg-card/45 px-6 py-8 text-sm text-muted-foreground backdrop-blur-xl sm:px-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CaseCipher. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <p className="max-w-2xl">
          CaseCipher helps teams track case ownership, status, and activity with
          a clean workflow and searchable history.
        </p>
      </div>
    </footer>
  );
}
