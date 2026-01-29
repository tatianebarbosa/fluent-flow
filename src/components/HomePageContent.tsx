"use client";

import Image from "next/image";
import { Button } from "@/components/Button";
import { useAppPreferences } from "@/components/AppPreferencesProvider";

export function HomePageContent() {
  const { t } = useAppPreferences();

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-5">
          <Image
            src="/fluent-flow-logo-v2.png"
            alt="Fluent Flow"
            width={128}
            height={128}
            className="h-28 w-28 object-contain"
            priority
          />
          <h1 className="text-6xl font-semibold leading-none tracking-normal">
            Fluent Flow
          </h1>
          <p className="mt-5 text-xl font-medium text-white/80">
            {t.homeTagline}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <Button href="/drill" className="w-full">
          {t.startFlow}
        </Button>
        <Button href="/cnh" variant="secondary" className="w-full">
          {t.cnh}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {[t.hear, t.repeat, t.flowVerb].map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            {index > 0 ? (
              <span className="h-1 w-1 rounded-full bg-emerald-200/50" />
            ) : null}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
