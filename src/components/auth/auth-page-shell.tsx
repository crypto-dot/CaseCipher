import type { ReactNode } from "react";


type AuthPageShellProps = {
  children: ReactNode;
  eyebrow: string;
};

export function AuthPageShell({ children, eyebrow }: AuthPageShellProps) {
  return (
    <section className="dashboard-main relative overflow-hidden">
      <div className="dashboard-shell-inner">
        <div className="mx-auto container grid min-h-[calc(100dvh-12rem)] items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-muted-foreground shadow-[inset_0_1px_0_hsl(210_40%_96%/0.06)]">
              {eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Secure access for every case workflow.
              </h1>
              <p className="text-pretty text-lg leading-8 text-muted-foreground">
                Sign in to manage intake, ownership, evidence, and activity in
                one encrypted workspace.
              </p>
            </div>
          </div>

          <div className="flex-1 justify-end flex auth-card relative">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
