"use client";

import type { VoiceGender } from "@/types";

const voiceQualityHints = [
  "natural",
  "neural",
  "google us english",
  "microsoft",
  "online",
  "premium",
  "enhanced",
];

const femaleVoiceHints = [
  "ava",
  "emma",
  "jenny",
  "joanna",
  "aria",
  "samantha",
  "zira",
  "michelle",
  "susan",
  "victoria",
  "karen",
  "linda",
  "sarah",
  "female",
  "woman",
];

const maleVoiceHints = [
  "andrew",
  "benjamin",
  "brandon",
  "brian",
  "christopher",
  "eric",
  "george",
  "guy",
  "david",
  "james",
  "jacob",
  "mark",
  "matthew",
  "paul",
  "roger",
  "ryan",
  "tony",
  "daniel",
  "alex",
  "fred",
  "thomas",
  "william",
  "male",
  "man",
];

let audioContext: AudioContext | null = null;
let keepAliveOscillator: OscillatorNode | null = null;
let keepAliveGain: GainNode | null = null;
let wakeLock: WakeLockSentinel | null = null;

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

type TimerCue = "tick" | "warning";

type WakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function getBestEnglishVoice(gender: VoiceGender): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"));

  if (voices.length === 0) return undefined;

  return voices
    .map((voice) => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      const genderHints = gender === "female" ? femaleVoiceHints : maleVoiceHints;
      const oppositeGenderHints =
        gender === "female" ? maleVoiceHints : femaleVoiceHints;
      const qualityScore = voiceQualityHints.reduce(
        (score, hint) => score + (name.includes(hint) ? 4 : 0),
        0,
      );
      const genderScore = genderHints.reduce(
        (score, hint) => score + (name.includes(hint) ? 30 : 0),
        0,
      );
      const oppositeGenderScore = oppositeGenderHints.reduce(
        (score, hint) => score + (name.includes(hint) ? 24 : 0),
        0,
      );
      const usScore = lang === "en-us" ? 6 : 0;
      const localScore = voice.localService ? 1 : 2;

      return {
        voice,
        score: genderScore - oppositeGenderScore + qualityScore + usScore + localScore,
      };
    })
    .sort((a, b) => b.score - a.score)[0]?.voice;
}

async function requestWakeLock(): Promise<void> {
  if (typeof navigator === "undefined") return;

  const wakeLockApi = (navigator as NavigatorWithWakeLock).wakeLock;
  if (!wakeLockApi || wakeLock) return;

  try {
    wakeLock = await wakeLockApi.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });
  } catch {
    wakeLock = null;
  }
}

export async function startTrainingAudioSession(): Promise<void> {
  if (typeof window === "undefined") return;

  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume();
  }

  if (!keepAliveOscillator) {
    keepAliveOscillator = context.createOscillator();
    keepAliveGain = context.createGain();
    keepAliveOscillator.frequency.value = 20;
    keepAliveGain.gain.value = 0.0001;
    keepAliveOscillator.connect(keepAliveGain);
    keepAliveGain.connect(context.destination);
    keepAliveOscillator.start();
  }

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Fluent Flow",
      artist: "Treino de inglês",
      album: "Modo áudio",
    });
    navigator.mediaSession.playbackState = "playing";
  }

  await requestWakeLock();
}

export function playTimerCue(cue: TimerCue = "tick"): void {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    void context.resume();
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const duration = cue === "warning" ? 0.14 : 0.055;
  const volume = cue === "warning" ? 0.16 : 0.075;

  oscillator.type = cue === "warning" ? "sine" : "triangle";
  oscillator.frequency.setValueAtTime(cue === "warning" ? 880 : 520, now);

  if (cue === "warning") {
    oscillator.frequency.exponentialRampToValueAtTime(660, now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
  oscillator.addEventListener("ended", () => {
    oscillator.disconnect();
    gain.disconnect();
  });
}

export async function stopTrainingAudioSession(): Promise<void> {
  if (typeof window === "undefined") return;

  if (keepAliveOscillator) {
    keepAliveOscillator.stop();
    keepAliveOscillator.disconnect();
    keepAliveOscillator = null;
  }

  if (keepAliveGain) {
    keepAliveGain.disconnect();
    keepAliveGain = null;
  }

  if (audioContext && audioContext.state !== "closed") {
    await audioContext.close();
    audioContext = null;
  }

  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "none";
  }

  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

export function speakEnglish(text: string, gender: VoiceGender = "female"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.voice = getBestEnglishVoice(gender) ?? null;
  utterance.rate = gender === "male" ? 0.7 : 0.72;
  utterance.pitch = gender === "male" ? 0.72 : 1.04;
  utterance.volume = 1;

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: text,
      artist: "Fluent Flow",
      album: "Treino de inglês",
    });
    navigator.mediaSession.playbackState = "playing";
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
}
