"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";
import { useAppPreferences } from "@/components/AppPreferencesProvider";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  compact?: boolean;
};

export function AppShell({ children, compact = false }: AppShellProps) {
  const { t } = useAppPreferences();

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,#1f3b35_0%,#0d1110_38%,#050606_100%)] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
        <header className="flex items-center justify-between gap-3 py-5 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold tracking-wide text-white"
          >
            <Image
              src="/fluent-flow-logo-v2.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            Fluent Flow
          </Link>
          <Link
            href="/settings"
            aria-label={t.settings}
            title={t.settings}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10 active:bg-white/15"
          >
            <Settings aria-hidden="true" size={18} strokeWidth={2.4} />
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
