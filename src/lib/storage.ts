"use client";

import { defaultFlowSettings } from "@/lib/flow";
import type {
  FlowDifficulty,
  FlowDuration,
  FlowInterval,
  FlowRestDuration,
  LearningBlockSize,
  LearningPattern,
  AppLanguage,
  AppPreferences,
  FlowLevelNumber,
  FlowSettings,
  VoiceGender,
} from "@/types";

const STORAGE_KEY = "fluent-flow-settings";
const APP_PREFERENCES_KEY = "fluent-flow-preferences";
const ACTIVE_FLOW_SESSION_KEY = "fluent-flow-active-session";
const SETTINGS_VERSION = 2;

export const defaultAppPreferences: AppPreferences = {
  language: "pt-BR",
  voiceGender: defaultFlowSettings.voiceGender,
};

export type ActiveFlowSession = {
  settings: FlowSettings;
  step: number;
  elapsed: number;
  completedSteps: number;
};

function isLevel(value: unknown): value is FlowLevelNumber {
  return value === 1 || value === 2 || value === 3;
}

function isDifficulty(value: unknown): value is FlowDifficulty {
  return value === "basic" || value === "intermediate" || value === "advanced";
}

function isDuration(value: unknown): value is FlowDuration {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 30 &&
    value <= 600
  );
}

function isInterval(value: unknown): value is FlowInterval {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 30
  );
}

function isRestDuration(value: unknown): value is FlowRestDuration {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 300
  );
}

function isLearningPattern(value: unknown): value is LearningPattern {
  return value === "item" || value === "block";
}

function isLearningBlockSize(value: unknown): value is LearningBlockSize {
  return value === 3 || value === 5 || value === 10;
}

function isVoiceGender(value: unknown): value is VoiceGender {
  return value === "female" || value === "male";
}

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === "pt-BR" || value === "en-US";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeFlowSettings(
  parsed: Partial<FlowSettings> & { settingsVersion?: number },
): FlowSettings {
  const hasCurrentSettingsVersion = parsed.settingsVersion === SETTINGS_VERSION;

  return {
    categoryId:
      typeof parsed.categoryId === "string"
        ? parsed.categoryId
        : defaultFlowSettings.categoryId,
    difficulty: isDifficulty(parsed.difficulty)
      ? parsed.difficulty
      : defaultFlowSettings.difficulty,
    level: isLevel(parsed.level) ? parsed.level : defaultFlowSettings.level,
    duration: isDuration(parsed.duration)
      ? parsed.duration
      : defaultFlowSettings.duration,
    intervalSeconds: isInterval(parsed.intervalSeconds)
      ? parsed.intervalSeconds
      : defaultFlowSettings.intervalSeconds,
    restDuration: isRestDuration(parsed.restDuration)
      ? parsed.restDuration
      : defaultFlowSettings.restDuration,
    learningMode:
      typeof parsed.learningMode === "boolean"
        ? parsed.learningMode
        : defaultFlowSettings.learningMode,
    learningPattern: isLearningPattern(parsed.learningPattern)
      ? parsed.learningPattern
      : defaultFlowSettings.learningPattern,
    learningBlockSize: isLearningBlockSize(parsed.learningBlockSize)
      ? parsed.learningBlockSize
      : defaultFlowSettings.learningBlockSize,
    voiceGender: isVoiceGender(parsed.voiceGender)
      ? parsed.voiceGender
      : defaultFlowSettings.voiceGender,
    showTranslation:
      typeof parsed.showTranslation === "boolean"
        ? parsed.showTranslation
        : defaultFlowSettings.showTranslation,
    showTime:
      hasCurrentSettingsVersion && typeof parsed.showTime === "boolean"
        ? parsed.showTime
        : defaultFlowSettings.showTime,
  };
}

function normalizeActiveFlowSession(value: unknown): ActiveFlowSession | null {
  if (!isRecord(value) || !isRecord(value.settings)) return null;

  const settings = normalizeFlowSettings(
    value.settings as Partial<FlowSettings> & { settingsVersion?: number },
  );
  const step =
    typeof value.step === "number" &&
    Number.isInteger(value.step) &&
    value.step >= 1
      ? value.step
      : 1;
  const elapsed =
    typeof value.elapsed === "number" && Number.isFinite(value.elapsed)
      ? Math.max(0, Math.min(value.elapsed, settings.duration))
      : 0;
  const completedSteps =
    typeof value.completedSteps === "number" &&
    Number.isInteger(value.completedSteps) &&
    value.completedSteps >= 0
      ? value.completedSteps
      : 0;

  return { settings, step, elapsed, completedSteps };
}

export function loadFlowSettings(): FlowSettings {
  if (typeof window === "undefined") {
    return defaultFlowSettings;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFlowSettings;

    const parsed = JSON.parse(raw) as Partial<FlowSettings> & {
      settingsVersion?: number;
    };
    return normalizeFlowSettings(parsed);
  } catch {
    return defaultFlowSettings;
  }
}

export function saveFlowSettings(settings: FlowSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...settings, settingsVersion: SETTINGS_VERSION }),
  );
}

export function loadAppPreferences(): AppPreferences {
  if (typeof window === "undefined") {
    return defaultAppPreferences;
  }

  const flowSettings = loadFlowSettings();

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_KEY);
    if (!raw) {
      return { ...defaultAppPreferences, voiceGender: flowSettings.voiceGender };
    }

    const parsed = JSON.parse(raw) as Partial<AppPreferences>;

    return {
      language: isAppLanguage(parsed.language)
        ? parsed.language
        : defaultAppPreferences.language,
      voiceGender: isVoiceGender(parsed.voiceGender)
        ? parsed.voiceGender
        : flowSettings.voiceGender,
    };
  } catch {
    return { ...defaultAppPreferences, voiceGender: flowSettings.voiceGender };
  }
}

export function saveAppPreferences(preferences: AppPreferences): FlowSettings {
  const currentFlowSettings = loadFlowSettings();
  const nextFlowSettings = {
    ...currentFlowSettings,
    voiceGender: preferences.voiceGender,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      APP_PREFERENCES_KEY,
      JSON.stringify(preferences),
    );
    document.documentElement.lang = preferences.language;
  }

  saveFlowSettings(nextFlowSettings);
  return nextFlowSettings;
}

export function loadActiveFlowSession(): ActiveFlowSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(ACTIVE_FLOW_SESSION_KEY);
    if (!raw) return null;

    return normalizeActiveFlowSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveActiveFlowSession(session: ActiveFlowSession): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    ACTIVE_FLOW_SESSION_KEY,
    JSON.stringify({
      ...session,
      settings: { ...session.settings, settingsVersion: SETTINGS_VERSION },
    }),
  );
}

export function updateActiveFlowSessionSettings(settings: FlowSettings): void {
  const session = loadActiveFlowSession();
  if (!session) return;

  saveActiveFlowSession({
    ...session,
    settings,
    elapsed: Math.min(session.elapsed, settings.duration),
  });
}

export function clearActiveFlowSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ACTIVE_FLOW_SESSION_KEY);
}
