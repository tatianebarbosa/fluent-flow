"use client";

import Image from "next/image";
import { Button } from "@/components/Button";
import { useAppPreferences } from "@/components/AppPreferencesProvider";

export function HomePageContent() {
  const { t } = useAppPreferences();

  return (
    <div className="min-w-0 space-y-7 min-[380px]:space-y-8">
      <div className="space-y-5">
        <div className="space-y-5">
          <Image
            src="/fluent-flow-logo-v2.png"
            alt="Fluent Flow"
            width={128}
            height={128}
            className="h-24 w-24 object-contain min-[380px]:h-28 min-[380px]:w-28"
            priority
          />
          <h1 className="text-5xl font-semibold leading-none tracking-normal min-[380px]:text-6xl">
            Fluent Flow
          </h1>
          <p className="mt-5 text-lg font-medium leading-7 text-white/80 min-[380px]:text-xl">
            {t.homeTagline}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <Button href="/drill" className="w-full">
          {t.homeEnglishTraining}
        </Button>
        <Button href="/cnh" variant="secondary" className="w-full">
          {t.cnh}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45 min-[380px]:justify-center min-[380px]:tracking-[0.18em]">
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
