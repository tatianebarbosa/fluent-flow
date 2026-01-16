"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CategorySelector } from "@/components/CategorySelector";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { defaultFlowSettings } from "@/lib/flow";
import { loadFlowSettings, saveFlowSettings } from "@/lib/storage";
import { formatDuration } from "@/lib/time";
import type {
  FlowDuration,
  FlowDifficulty,
  FlowInterval,
  FlowLevelNumber,
  FlowRestDuration,
  FlowSettings,
  LearningBlockSize,
  LearningPattern,
  VoiceGender,
} from "@/types";

type FlowSettingsFormProps = {
  actionLabel?: string;
  onSaved?: (settings: FlowSettings) => void;
};

const levels: FlowLevelNumber[] = [1, 2, 3];
const difficulties: Array<{ value: FlowDifficulty; label: string }> = [
  { value: "basic", label: "Básico" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];
const durations: FlowDuration[] = [30, 60];
const intervals: FlowInterval[] = [2, 3];
const restDurations: FlowRestDuration[] = [10, 30];
const learningPatterns: Array<{ value: LearningPattern; label: string }> = [
  { value: "block", label: "Repetir sequência" },
  { value: "item", label: "Repetir palavra" },
];
const learningBlockSizes: LearningBlockSize[] = [3, 5, 10];
const voiceOptions: Array<{ value: VoiceGender; label: string }> = [
  { value: "female", label: "Feminina" },
  { value: "male", label: "Masculina" },
];

export function FlowSettingsForm({
  actionLabel = "Salvar ajustes",
  onSaved,
}: FlowSettingsFormProps) {
  const [settings, setSettings] = useState<FlowSettings>(defaultFlowSettings);
  const [loaded, setLoaded] = useState(false);
  const [openDifficulty, setOpenDifficulty] = useState<FlowDifficulty | null>(
    null,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSettings(loadFlowSettings());
      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function updateSettings(patch: Partial<FlowSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function selectDifficulty(difficulty: FlowDifficulty) {
    updateSettings({ difficulty });
    setOpenDifficulty(difficulty);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveFlowSettings(settings);
    onSaved?.(settings);
  }

  function addDuration() {
    updateSettings({ duration: Math.min(settings.duration + 30, 600) });
  }

  function addInterval() {
    updateSettings({ intervalSeconds: Math.min(settings.intervalSeconds + 1, 30) });
  }

  function addRestDuration() {
    updateSettings({ restDuration: Math.min(settings.restDuration + 10, 300) });
  }

  const blockPreview = Array.from(
    { length: settings.learningBlockSize },
    (_, index) => index + 1,
  ).join(" ");
  const learningPreview =
    settings.learningPattern === "block"
      ? `${blockPreview} -> repete essa sequência`
      : "1 1 2 2 3 3 -> repete cada palavra";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CategorySelector
        value={settings.categoryId}
        onChange={(categoryId) => updateSettings({ categoryId })}
      />

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Nível
        </p>
        <div className="grid gap-2">
          {difficulties.map((difficulty) => (
            <div key={difficulty.value} className="space-y-2">
              <button
                type="button"
                onClick={() => selectDifficulty(difficulty.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  settings.difficulty === difficulty.value
                    ? "border-emerald-300 bg-emerald-300 text-neutral-950"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                }`}
              >
                {difficulty.label}
              </button>
              {openDifficulty === difficulty.value ? (
                <div className="grid grid-cols-3 gap-2">
                  {levels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateSettings({ level })}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        settings.level === level
                          ? "border-white bg-white text-neutral-950"
                          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Duração
          </p>
          <div className="grid gap-2">
            {durations.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => updateSettings({ duration })}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  settings.duration === duration
                    ? "border-white bg-white text-neutral-950"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                }`}
              >
                {formatDuration(duration)}
              </button>
            ))}
            {!durations.includes(settings.duration) ? (
              <button
                type="button"
                className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition"
              >
                {formatDuration(settings.duration)}
              </button>
            ) : null}
            <button
              type="button"
              onClick={addDuration}
              aria-label="Aumentar duração"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-2xl font-semibold leading-none text-white transition hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Intervalo
          </p>
          <div className="grid gap-2">
            {intervals.map((intervalSeconds) => (
              <button
                key={intervalSeconds}
                type="button"
                onClick={() => updateSettings({ intervalSeconds })}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  settings.intervalSeconds === intervalSeconds
                    ? "border-white bg-white text-neutral-950"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                }`}
              >
                {intervalSeconds}s
              </button>
            ))}
            {!intervals.includes(settings.intervalSeconds) ? (
              <button
                type="button"
                className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition"
              >
                {settings.intervalSeconds}s
              </button>
            ) : null}
            <button
              type="button"
              onClick={addInterval}
              aria-label="Aumentar intervalo"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-2xl font-semibold leading-none text-white transition hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Descanso
        </p>
        <div className="grid grid-cols-3 gap-2">
          {restDurations.map((restDuration) => (
            <button
              key={restDuration}
              type="button"
              onClick={() => updateSettings({ restDuration })}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                settings.restDuration === restDuration
                  ? "border-white bg-white text-neutral-950"
                  : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
              }`}
            >
              {formatDuration(restDuration)}
            </button>
          ))}
          {!restDurations.includes(settings.restDuration) ? (
            <button
              type="button"
              className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition"
            >
              {formatDuration(settings.restDuration)}
            </button>
          ) : null}
          <button
            type="button"
            onClick={addRestDuration}
            aria-label="Aumentar descanso"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-2xl font-semibold leading-none text-white transition hover:bg-white/10"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Voz
          </p>
          <div className="grid grid-cols-2 gap-2">
            {voiceOptions.map((voiceOption) => (
              <button
                key={voiceOption.value}
                type="button"
                onClick={() => updateSettings({ voiceGender: voiceOption.value })}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  settings.voiceGender === voiceOption.value
                    ? "border-white bg-white text-neutral-950"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                }`}
              >
                {voiceOption.label}
              </button>
            ))}
          </div>
        </div>
        <Toggle
          checked={settings.showTranslation}
          label="Mostrar tradução"
          description="A tradução aparece menor abaixo do inglês."
          onChange={(showTranslation) => updateSettings({ showTranslation })}
        />
        <Toggle
          checked={settings.learningMode}
          label="Modo aprendizado"
          description="Repete por item ou por blocos para fixar melhor."
          onChange={(learningMode) => updateSettings({ learningMode })}
        />
        {settings.learningMode ? (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Como repetir
              </p>
              <p className="mt-1 text-xs leading-5 text-white/50">
                Escolha se o treino repete uma palavra de cada vez ou uma
                sequência inteira antes de avançar.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Estilo
              </p>
              <div className="grid grid-cols-2 gap-2">
                {learningPatterns.map((pattern) => (
                  <button
                    key={pattern.value}
                    type="button"
                    onClick={() =>
                      updateSettings({ learningPattern: pattern.value })
                    }
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      settings.learningPattern === pattern.value
                        ? "border-white bg-white text-neutral-950"
                        : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                    }`}
                  >
                    {pattern.label}
                  </button>
                ))}
              </div>
            </div>

            {settings.learningPattern === "block" ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Quantas antes de repetir
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {learningBlockSizes.map((learningBlockSize) => (
                    <button
                      key={learningBlockSize}
                      type="button"
                      onClick={() => updateSettings({ learningBlockSize })}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        settings.learningBlockSize === learningBlockSize
                          ? "border-white bg-white text-neutral-950"
                          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                      }`}
                    >
                      {learningBlockSize}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
                Exemplo
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-white/80">
                {learningPreview}
              </p>
            </div>
          </div>
        ) : null}
        <Toggle
          checked={settings.showTime}
          label="Mostrar tempo"
          description="Opcional. Desligado por padrão para manter o treino em fluxo."
          onChange={(showTime) => updateSettings({ showTime })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={!loaded}>
        {actionLabel}
      </Button>
    </form>
  );
}
