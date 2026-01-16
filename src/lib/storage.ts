"use client";

import { defaultFlowSettings } from "@/lib/flow";
import type {
  FlowDifficulty,
  FlowDuration,
  FlowInterval,
  FlowRestDuration,
  LearningBlockSize,
  LearningPattern,
  FlowLevelNumber,
  FlowSettings,
  VoiceGender,
} from "@/types";

const STORAGE_KEY = "fluent-flow-settings";
const SETTINGS_VERSION = 2;

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
    value >= 2 &&
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
