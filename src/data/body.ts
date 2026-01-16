import type { FlowCategory } from "@/types";

export const body: FlowCategory = {
  id: "body",
  label: "Body",
  group: "Daily life",
  levels: {
    1: [
      { word: "hand", translation: "mao" },
      { word: "head", translation: "cabeca" },
      { word: "foot", translation: "pe" },
      { word: "eyes", translation: "olhos" },
    ],
    2: [
      { word: "arm", translation: "braco" },
      { word: "leg", translation: "perna" },
      { word: "back", translation: "costas" },
      { word: "shoulder", translation: "ombro" },
    ],
    3: [
      { word: "Raise your hand", translation: "levante sua mao" },
      { word: "Close your eyes", translation: "feche os olhos" },
      { word: "Move your foot", translation: "mova seu pe" },
      { word: "Touch your head", translation: "toque sua cabeca" },
    ],
  },
};
