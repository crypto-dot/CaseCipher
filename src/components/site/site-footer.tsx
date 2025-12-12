import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto container flex flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} CaseCipher. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
        <p className="max-w-2xl">
          CaseCipher helps teams track case ownership, status, and activity with a clean workflow
          and searchable history.
        </p>
      </div>
    </footer>
  );
}


