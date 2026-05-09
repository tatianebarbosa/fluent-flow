"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppPreferences } from "@/components/AppPreferencesProvider";
import { Button } from "@/components/Button";
import { getMessages } from "@/lib/i18n";
import { updateActiveFlowSessionSettings } from "@/lib/storage";
import type { AppLanguage, AppPreferences, VoiceGender } from "@/types";

type SettingsPageContentProps = {
  resumeOnSave: boolean;
  returnHref: string;
  returnLabel: string;
};

const languageOptions: Array<{ value: AppLanguage; label: string }> = [
  { value: "pt-BR", label: "Português" },
  { value: "en-US", label: "English" },
];

const voiceOptions: Array<{ value: VoiceGender; label: string }> = [
  { value: "female", label: "Feminina" },
  { value: "male", label: "Masculina" },
];

export function SettingsPageContent({
  resumeOnSave,
  returnHref,
  returnLabel,
}: SettingsPageContentProps) {
  const router = useRouter();
  const {
    loaded,
    preferences: savedPreferences,
    savePreferences,
  } = useAppPreferences();
  const [preferences, setPreferences] = useState<AppPreferences>(savedPreferences);
  const t = getMessages(preferences.language);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPreferences(savedPreferences);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [savedPreferences]);

  function updatePreferences(patch: Partial<AppPreferences>) {
    const nextPreferences = { ...preferences, ...patch };
    setPreferences(nextPreferences);
    const nextFlowSettings = savePreferences(nextPreferences);

    if (resumeOnSave) {
      updateActiveFlowSessionSettings(nextFlowSettings);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    router.push(returnHref);
  }

  return (
    <div className="min-w-0 space-y-6 pb-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
          {t.settings}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal min-[380px]:text-4xl">
          {t.preferences}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-3 shadow-2xl shadow-black/30 backdrop-blur min-[380px]:rounded-[2rem] min-[380px]:p-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              {t.appLanguage}
            </p>
            <div className="grid gap-2">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreferences({ language: option.value })}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    preferences.language === option.value
                      ? "border-emerald-200 bg-emerald-300 text-neutral-950"
                      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              {t.voice}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {voiceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreferences({ voiceGender: option.value })}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    preferences.voiceGender === option.value
                      ? "border-emerald-200 bg-emerald-300 text-neutral-950"
                      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                  }`}
                >
                  {option.value === "female" ? t.female : t.male}
                </button>
              ))}
            </div>
          </div>
        </section>

        <Button type="submit" className="w-full" disabled={!loaded}>
          {t.saveSettings}
        </Button>
      </form>

      <Button href={returnHref} variant="secondary" className="w-full">
        {returnLabel === "Voltar ao treino" ? t.backToTraining : t.back}
      </Button>
    </div>
  );
}
