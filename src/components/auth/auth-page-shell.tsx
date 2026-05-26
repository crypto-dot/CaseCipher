import type { ReactNode } from "react";


export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto container flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
        {children}
      </div>
    </section>
  );
}
