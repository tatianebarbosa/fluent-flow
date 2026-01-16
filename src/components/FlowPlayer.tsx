"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/Button";
import { FlowSettingsForm } from "@/components/FlowSettingsForm";
import {
  defaultFlowSettings,
  getCategory,
  getDifficultyDisplayLabel,
  getItems,
  getPracticeItemForStep,
} from "@/lib/flow";
import { getCategoryDisplayLabel } from "@/lib/labels";
import { loadFlowSettings, saveFlowSettings } from "@/lib/storage";
import { formatDuration } from "@/lib/time";
import {
  speakEnglish,
  startTrainingAudioSession,
  stopSpeech,
  stopTrainingAudioSession,
} from "@/lib/speech";
import type { FlowSettings } from "@/types";

const PREPARE_DURATION_SECONDS = 10;

type FlowState =
  | "setup"
  | "preparing"
  | "running"
  | "paused"
  | "resting"
  | "done";

type FlowPlayerProps = {
  autoStart?: boolean;
};

export function FlowPlayer({ autoStart = false }: FlowPlayerProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<FlowSettings>(defaultFlowSettings);
  const [flowState, setFlowState] = useState<FlowState>("setup");
  const [step, setStep] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [prepareRemaining, setPrepareRemaining] = useState(
    PREPARE_DURATION_SECONDS,
  );
  const [restRemaining, setRestRemaining] = useState(defaultFlowSettings.restDuration);
  const intervalRef = useRef<number | null>(null);
  const prepareTimeoutRef = useRef<number | null>(null);
  const prepareIntervalRef = useRef<number | null>(null);
  const restTimeoutRef = useRef<number | null>(null);
  const restIntervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const elapsedBeforeRunRef = useRef(0);
  const settingsRef = useRef(settings);
  const stepRef = useRef(step);
  const autoStartedRef = useRef(false);
  const beginFlowRef = useRef<(nextSettings?: FlowSettings) => void>(() => {});

  const items = useMemo(() => getItems(settings), [settings]);
  const item = getPracticeItemForStep(items, step, settings);
  const category = getCategory(settings.categoryId);
  const remaining = Math.max(0, settings.duration - elapsed);

  const clearFlowInterval = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearPrepareTimers = useCallback(() => {
    if (prepareTimeoutRef.current) {
      window.clearTimeout(prepareTimeoutRef.current);
      prepareTimeoutRef.current = null;
    }

    if (prepareIntervalRef.current) {
      window.clearInterval(prepareIntervalRef.current);
      prepareIntervalRef.current = null;
    }
  }, []);

  const clearRestTimers = useCallback(() => {
    if (restTimeoutRef.current) {
      window.clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }

    if (restIntervalRef.current) {
      window.clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
  }, []);

  const finishFlow = useCallback(
    (finalStep: number) => {
      clearFlowInterval();
      clearPrepareTimers();
      stopSpeech();
      startedAtRef.current = null;
      elapsedBeforeRunRef.current = 0;
      setCompletedSteps(finalStep);
      setElapsed(settingsRef.current.duration);

      const restDuration = settingsRef.current.restDuration;
      if (restDuration <= 0) {
        beginFlowRef.current(settingsRef.current);
        return;
      }

      setRestRemaining(restDuration);
      setFlowState("resting");
      speakEnglish("Rest", settingsRef.current.voiceGender);

      restIntervalRef.current = window.setInterval(() => {
        setRestRemaining((current) => Math.max(1, current - 1));
      }, 1000);

      restTimeoutRef.current = window.setTimeout(() => {
        clearRestTimers();
        beginFlowRef.current(settingsRef.current);
      }, restDuration * 1000);
    },
    [clearFlowInterval, clearPrepareTimers, clearRestTimers],
  );

  const startTicker = useCallback(
    (startStep: number) => {
      clearFlowInterval();
      const startedAt = Date.now();
      startedAtRef.current = startedAt;
      let lastAdvancedAt = elapsedBeforeRunRef.current;

      intervalRef.current = window.setInterval(() => {
        const activeSettings = settingsRef.current;
        const activeItems = getItems(activeSettings);
        const totalElapsed =
          elapsedBeforeRunRef.current + (Date.now() - startedAt) / 1000;

        if (totalElapsed >= activeSettings.duration) {
          const finalStep = Math.max(startStep, stepRef.current);
          finishFlow(finalStep);
          return;
        }

        setElapsed(totalElapsed);

        if (totalElapsed - lastAdvancedAt >= activeSettings.intervalSeconds) {
          if (
            !activeSettings.learningMode &&
            stepRef.current >= activeItems.length
          ) {
            finishFlow(stepRef.current);
            return;
          }

          lastAdvancedAt += activeSettings.intervalSeconds;
          setStep((currentStep) => {
            const nextStep = currentStep + 1;
            stepRef.current = nextStep;
            speakEnglish(
              getPracticeItemForStep(activeItems, nextStep, activeSettings).word,
              activeSettings.voiceGender,
            );
            return nextStep;
          });
        }
      }, 120);
    },
    [clearFlowInterval, finishFlow],
  );

  const startRunning = useCallback(
    (nextSettings: FlowSettings) => {
      setFlowState("running");
      speakEnglish(
        getPracticeItemForStep(getItems(nextSettings), 1, nextSettings).word,
        nextSettings.voiceGender,
      );
      startTicker(1);
    },
    [startTicker],
  );

  const beginFlow = useCallback((nextSettings = settings) => {
    saveFlowSettings(nextSettings);
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    setStep(1);
    stepRef.current = 1;
    setElapsed(0);
    setCompletedSteps(0);
    setPrepareRemaining(PREPARE_DURATION_SECONDS);
    elapsedBeforeRunRef.current = 0;
    clearPrepareTimers();
    setFlowState("preparing");
    void startTrainingAudioSession();
    speakEnglish("Get ready", nextSettings.voiceGender);

    prepareIntervalRef.current = window.setInterval(() => {
      setPrepareRemaining((current) => Math.max(1, current - 1));
    }, 1000);

    prepareTimeoutRef.current = window.setTimeout(() => {
      clearPrepareTimers();
      startRunning(nextSettings);
    }, PREPARE_DURATION_SECONDS * 1000);
  }, [clearPrepareTimers, settings, startRunning]);

  useEffect(() => {
    beginFlowRef.current = beginFlow;
  }, [beginFlow]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = loadFlowSettings();
      settingsRef.current = saved;
      setSettings(saved);

      if (autoStart && !autoStartedRef.current) {
        autoStartedRef.current = true;
        beginFlow(saved);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [autoStart, beginFlow]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    return () => {
      clearFlowInterval();
      clearPrepareTimers();
      clearRestTimers();
      stopSpeech();
      void stopTrainingAudioSession();
    };
  }, [clearFlowInterval, clearPrepareTimers, clearRestTimers]);

  function pauseFlow() {
    if (flowState === "preparing") {
      clearPrepareTimers();
      stopSpeech();
      void stopTrainingAudioSession();
      setFlowState("setup");
      return;
    }

    if (flowState === "resting") {
      clearRestTimers();
      beginFlow(settingsRef.current);
      return;
    }

    if (flowState !== "running" || startedAtRef.current === null) return;
    elapsedBeforeRunRef.current += (Date.now() - startedAtRef.current) / 1000;
    setElapsed(elapsedBeforeRunRef.current);
    startedAtRef.current = null;
    clearFlowInterval();
    stopSpeech();
    void stopTrainingAudioSession();
    setFlowState("paused");
  }

  function resumeFlow() {
    if (flowState !== "paused") return;
    setFlowState("running");
    void startTrainingAudioSession();
    speakEnglish(item.word, settings.voiceGender);
    startTicker(step);
  }

  function finishEarly() {
    finishFlow(step);
  }

  function addRestTime() {
    setRestRemaining((current) => current + 15);

    if (restTimeoutRef.current) {
      window.clearTimeout(restTimeoutRef.current);
    }

    restTimeoutRef.current = window.setTimeout(() => {
      clearRestTimers();
      beginFlow(settingsRef.current);
    }, (restRemaining + 15) * 1000);
  }

  if (flowState === "setup") {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
            Modo Flow
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            Treine sem olhar o relógio.
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Escolha uma categoria ou use seus ajustes salvos. O treino avança
            automaticamente enquanto o tempo fica escondido.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-2xl shadow-black/30 backdrop-blur">
          <FlowSettingsForm actionLabel="Iniciar Flow" onSaved={beginFlow} />
        </div>
      </div>
    );
  }

  if (flowState === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
          Concluído!
        </p>
        <h1 className="mt-4 text-6xl font-semibold tracking-normal">
          Concluído!
        </h1>
        <p className="mt-5 text-lg text-white/70">
          {completedSteps} repetições realizadas
        </p>
        <div className="mt-10 grid w-full gap-3">
          <Button onClick={() => beginFlow(settings)}>Começar de novo</Button>
          <Button variant="secondary" onClick={() => setFlowState("setup")}>
            Alterar ajustes
          </Button>
        </div>
      </div>
    );
  }

  if (flowState === "preparing") {
    return (
      <div className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
            Se prepare
          </p>
          <h1 className="mt-5 text-7xl font-semibold tracking-normal">
            {prepareRemaining}
          </h1>
        </section>

        <div className="grid pb-2">
          <Button variant="secondary" onClick={pauseFlow}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (flowState === "resting") {
    return (
      <div className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
            Descanso
          </p>
          <h1 className="mt-5 text-7xl font-semibold tracking-normal">
            {formatDuration(restRemaining)}
          </h1>
        </section>

        <div className="grid grid-cols-[auto_1fr] gap-3 pb-2">
          <button
            type="button"
            onClick={addRestTime}
            aria-label="Adicionar 15 segundos ao descanso"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white transition hover:bg-white/15 active:bg-white/20"
          >
            +15
          </button>
          <Button variant="secondary" onClick={pauseFlow}>
            Pular descanso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 text-xs text-white/45">
        <div className="min-w-0">
          <span>
            {getCategoryDisplayLabel(category.id, category.label)} ·{" "}
            {getDifficultyDisplayLabel(settings.difficulty)} {settings.level}
          </span>
          {settings.showTime ? (
            <span className="ml-2">{formatDuration(remaining)}</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => router.push("/settings")}
          aria-label="Ajustes"
          title="Ajustes"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10"
        >
          <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={2.4} />
        </button>
      </div>

      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="max-w-full text-balance text-6xl font-semibold leading-tight tracking-normal sm:text-7xl">
          {item.word}
        </h1>
        {settings.showTranslation ? (
          <p className="mt-5 text-xl font-medium text-emerald-100/70">
            {item.translation}
          </p>
        ) : null}
      </section>

      <div className="grid grid-cols-[1fr_auto] gap-3 pb-2">
        {flowState === "running" ? (
          <Button variant="secondary" className="gap-2" onClick={pauseFlow}>
            <Pause aria-hidden="true" size={18} strokeWidth={2.4} />
            Pausar
          </Button>
        ) : (
          <Button variant="secondary" className="gap-2" onClick={resumeFlow}>
            <Play aria-hidden="true" size={18} strokeWidth={2.4} />
            Continuar
          </Button>
        )}
        <Button
          variant="secondary"
          className="w-14 px-0"
          onClick={() => speakEnglish(item.word, settings.voiceGender)}
          aria-label="Repetir"
          title="Repetir"
        >
          <RotateCcw aria-hidden="true" size={18} strokeWidth={2.4} />
          <span className="sr-only">Repetir</span>
        </Button>
        <Button variant="ghost" className="col-span-2" onClick={finishEarly}>
          Finalizar treino
        </Button>
      </div>
    </div>
  );
}
