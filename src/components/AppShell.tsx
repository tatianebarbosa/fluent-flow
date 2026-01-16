import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  compact?: boolean;
};

export function AppShell({ children, compact = false }: AppShellProps) {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,#1f3b35_0%,#0d1110_38%,#050606_100%)] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
        <header className="flex items-center py-5 text-sm">
          <Link href="/" className="font-semibold tracking-wide text-white">
            Fluent Flow
          </Link>
        </header>
        <section
          className={
            compact
              ? "flex flex-1 flex-col pb-6"
              : "flex flex-1 flex-col justify-center pb-10"
          }
        >
          {children}
        </section>
      </div>
    </main>
  );
}
