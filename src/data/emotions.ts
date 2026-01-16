import type { FlowCategory } from "@/types";

export const emotions: FlowCategory = {
  id: "emotions",
  label: "Emotions",
  group: "Emotions",
  levels: {
    1: [
      { word: "happy", translation: "feliz" },
      { word: "tired", translation: "cansado" },
      { word: "angry", translation: "bravo" },
      { word: "sad", translation: "triste" },
    ],
    2: [
      { word: "calm", translation: "calmo" },
      { word: "worried", translation: "preocupado" },
      { word: "excited", translation: "animado" },
      { word: "confident", translation: "confiante" },
    ],
    3: [
      { word: "I am happy", translation: "estou feliz" },
      { word: "I feel tired", translation: "me sinto cansado" },
      { word: "Stay calm", translation: "fique calmo" },
      { word: "I am not worried", translation: "nao estou preocupado" },
    ],
  },
};
