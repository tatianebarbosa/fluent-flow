"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useAppPreferences } from "@/components/AppPreferencesProvider";
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
import {
  clearActiveFlowSession,
  loadActiveFlowSession,
  loadFlowSettings,
  saveFlowSettings,
} from "@/lib/storage";
import { formatDuration } from "@/lib/time";
import {
  playTimerCue,
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
  resumeSession?: boolean;
};

type FinishFlowOptions = {
  startRest?: boolean;
};

export function FlowPlayer({
  autoStart = false,
  resumeSession = false,
}: FlowPlayerProps) {
  const { preferences, t } = useAppPreferences();
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
  const lastFlowCountdownSecondRef = useRef<number | null>(null);
  const autoStartedRef = useRef(false);
  const initialLoadRef = useRef(false);
  const beginFlowRef = useRef<(nextSettings?: FlowSettings) => void>(() => {});

  const items = useMemo(() => getItems(settings), [settings]);
  const item = getPracticeItemForStep(items, step, settings);
  const displayWord = item.displayWord ?? item.word;
  const category = getCategory(settings.categoryId);
  const remaining = Math.max(0, settings.duration - elapsed);
  const progressRatio =
    settings.duration > 0
      ? Math.min(1, Math.max(0, elapsed / settings.duration))
      : 0;
  const ringCircumference = 2 * Math.PI * 46;
  const ringDashOffset = ringCircumference * (1 - progressRatio);

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
    (finalStep: number, { startRest = true }: FinishFlowOptions = {}) => {
      clearActiveFlowSession();
      clearFlowInterval();
      clearPrepareTimers();
      clearRestTimers();
      stopSpeech();
      startedAtRef.current = null;
      elapsedBeforeRunRef.current = 0;
      lastFlowCountdownSecondRef.current = null;
      setCompletedSteps(finalStep);
      setElapsed(settingsRef.current.duration);

      if (!startRest) {
        void stopTrainingAudioSession();
        setFlowState("done");
        return;
      }

      const restDuration = settingsRef.current.restDuration;
      if (restDuration <= 0) {
        beginFlowRef.current(settingsRef.current);
        return;
      }

      setRestRemaining(restDuration);
      setFlowState("resting");
      speakEnglish("Rest", settingsRef.current.voiceGender);

      restIntervalRef.current = window.setInterval(() => {
        setRestRemaining((current) => {
          if (current <= 1) return current;

          const next = Math.max(1, current - 1);
          playTimerCue(next <= 3 ? "warning" : "tick");
          return next;
        });
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
      lastFlowCountdownSecondRef.current = null;

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

        const secondsLeft = Math.ceil(activeSettings.duration - totalElapsed);
        if (
          secondsLeft > 0 &&
          secondsLeft <= 5 &&
          lastFlowCountdownSecondRef.current !== secondsLeft
        ) {
          lastFlowCountdownSecondRef.current = secondsLeft;
          playTimerCue(secondsLeft <= 3 ? "warning" : "tick");
        }

        if (totalElapsed - lastAdvancedAt >= activeSettings.intervalSeconds) {
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
    clearActiveFlowSession();
    saveFlowSettings(nextSettings);
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    setStep(1);
    stepRef.current = 1;
    setElapsed(0);
    setCompletedSteps(0);
    setPrepareRemaining(PREPARE_DURATION_SECONDS);
    elapsedBeforeRunRef.current = 0;
    lastFlowCountdownSecondRef.current = null;
    clearPrepareTimers();
    setFlowState("preparing");
    void startTrainingAudioSession();
    speakEnglish("Get ready", nextSettings.voiceGender);

    prepareIntervalRef.current = window.setInterval(() => {
      setPrepareRemaining((current) => {
        if (current <= 1) return current;

        const next = Math.max(1, current - 1);
        playTimerCue(next <= 3 ? "warning" : "tick");
        return next;
      });
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
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const frame = window.requestAnimationFrame(() => {
      const activeSession = resumeSession ? loadActiveFlowSession() : null;

      if (activeSession) {
        settingsRef.current = activeSession.settings;
        setSettings(activeSession.settings);
        setStep(activeSession.step);
        stepRef.current = activeSession.step;
        setElapsed(activeSession.elapsed);
        elapsedBeforeRunRef.current = activeSession.elapsed;
        setCompletedSteps(activeSession.completedSteps);
        setFlowState("paused");
        return;
      }

      if (!resumeSession) {
        clearActiveFlowSession();
      }

      const saved = loadFlowSettings();
      settingsRef.current = saved;
      setSettings(saved);

      if (autoStart && !autoStartedRef.current) {
        autoStartedRef.current = true;
        beginFlow(saved);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [autoStart, beginFlow, resumeSession]);

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
    finishFlow(Math.max(step, stepRef.current), { startRest: false });
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
            {t.flowMode}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            {t.flowTitle}
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            {t.flowDescription}
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-2xl shadow-black/30 backdrop-blur">
          <FlowSettingsForm actionLabel={t.startFlow} onSaved={beginFlow} />
        </div>
      </div>
    );
  }

  if (flowState === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
          {t.completed}
        </p>
        <h1 className="mt-4 text-6xl font-semibold tracking-normal">
          {t.completed}
        </h1>
        <p className="mt-5 text-lg text-white/70">
          {completedSteps} {t.repetitionsCompleted}
        </p>
        <div className="mt-10 grid w-full gap-3">
          <Button onClick={() => beginFlow(settings)}>{t.startAgain}</Button>
          <Button variant="secondary" onClick={() => setFlowState("setup")}>
            {t.changeSettings}
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
            {t.prepare}
          </p>
          <h1 className="mt-5 text-7xl font-semibold tracking-normal">
            {prepareRemaining}
          </h1>
        </section>

        <div className="grid pb-2">
          <Button variant="secondary" onClick={pauseFlow}>
            {t.cancel}
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
            {t.rest}
          </p>
          <h1 className="mt-5 text-7xl font-semibold tracking-normal">
            {formatDuration(restRemaining)}
          </h1>
        </section>

        <div className="grid grid-cols-[auto_1fr] gap-3 pb-2">
          <button
            type="button"
            onClick={addRestTime}
            aria-label={t.addRestTime}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white transition hover:bg-white/15 active:bg-white/20"
          >
            +15
          </button>
          <Button variant="secondary" onClick={pauseFlow}>
            {t.skipRest}
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
            {getCategoryDisplayLabel(
              category.id,
              category.label,
              preferences.language,
            )} ·{" "}
            {getDifficultyDisplayLabel(
              settings.difficulty,
              preferences.language,
            )} {settings.level}
          </span>
        </div>
      </div>

      <section className="flex flex-1 flex-col items-center justify-center text-center">
        {settings.showTime ? (
          <div className="relative flex aspect-square w-[82vw] max-w-[22rem] items-center justify-center">
            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255, 255, 255, 0.10)"
                strokeWidth="2.5"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgb(110 231 183)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashOffset}
                className="transition-[stroke-dashoffset] duration-300 ease-linear"
              />
            </svg>

            <div className="relative z-10 flex max-w-[15rem] flex-col items-center px-6">
              <p className="mb-5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60">
                {formatDuration(remaining)}
              </p>
              <h1 className="max-w-full text-balance text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
                {displayWord}
              </h1>
              {settings.showTranslation ? (
                <p className="mt-5 text-xl font-medium text-emerald-100/70">
                  {item.translation}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <h1 className="max-w-full text-balance text-6xl font-semibold leading-tight tracking-normal sm:text-7xl">
              {displayWord}
            </h1>
            {settings.showTranslation ? (
              <p className="mt-5 text-xl font-medium text-emerald-100/70">
                {item.translation}
              </p>
            ) : null}
          </>
        )}
      </section>

      <div className="grid grid-cols-[1fr_auto] gap-3 pb-2">
        {flowState === "running" ? (
          <Button variant="secondary" className="gap-2" onClick={pauseFlow}>
            <Pause aria-hidden="true" size={18} strokeWidth={2.4} />
            {t.pause}
          </Button>
        ) : (
          <Button variant="secondary" className="gap-2" onClick={resumeFlow}>
            <Play aria-hidden="true" size={18} strokeWidth={2.4} />
            {t.continue}
          </Button>
        )}
        <Button
          variant="secondary"
          className="w-14 px-0"
          onClick={() => speakEnglish(item.word, settings.voiceGender)}
          aria-label={t.repeat}
          title={t.repeat}
        >
          <RotateCcw aria-hidden="true" size={18} strokeWidth={2.4} />
          <span className="sr-only">{t.repeat}</span>
        </Button>
        <Button variant="ghost" className="col-span-2" onClick={finishEarly}>
          {t.finishTraining}
        </Button>
      </div>
    </div>
  );
}
