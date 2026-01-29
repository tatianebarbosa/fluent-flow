"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { getMessages } from "@/lib/i18n";
import {
  defaultAppPreferences,
  loadAppPreferences,
  saveAppPreferences,
} from "@/lib/storage";
import type { AppPreferences, FlowSettings } from "@/types";

type AppPreferencesContextValue = {
  loaded: boolean;
  preferences: AppPreferences;
  savePreferences: (preferences: AppPreferences) => FlowSettings;
  setPreferences: (preferences: AppPreferences) => void;
  t: ReturnType<typeof getMessages>;
};

const AppPreferencesContext =
  createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<AppPreferences>(defaultAppPreferences);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedPreferences = loadAppPreferences();
      setPreferences(savedPreferences);
      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = preferences.language;
  }, [preferences.language]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      loaded,
      preferences,
      savePreferences(nextPreferences) {
        const nextFlowSettings = saveAppPreferences(nextPreferences);
        setPreferences(nextPreferences);
        return nextFlowSettings;
      },
      setPreferences,
      t: getMessages(preferences.language),
    }),
    [loaded, preferences],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider");
  }

  return context;
}
