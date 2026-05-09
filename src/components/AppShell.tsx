"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useAppPreferences } from "@/components/AppPreferencesProvider";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  compact?: boolean;
};

export function AppShell({ children, compact = false }: AppShellProps) {
  const { t } = useAppPreferences();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,#1f3b35_0%,#0d1110_38%,#050606_100%)] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-md min-w-0 flex-col px-4 min-[380px]:px-5">
        <header
          className={`flex items-center gap-3 py-4 text-sm min-[380px]:py-5 ${
            isHome ? "justify-end" : "justify-between"
          }`}
        >
          {!isHome ? (
            <Link
              href="/"
              className="inline-flex min-w-0 items-center gap-2 font-semibold tracking-wide text-white"
            >
              <Image
                src="/fluent-flow-logo-v2.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 object-contain"
                priority
              />
              <span className="truncate">Fluent Flow</span>
            </Link>
          ) : null}
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
              ? "flex min-w-0 flex-1 flex-col pb-6"
              : "flex min-w-0 flex-1 flex-col justify-center pb-10"
          }
        >
          {children}
        </section>
      </div>
    </main>
  );
}
