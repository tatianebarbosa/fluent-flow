import type { FlowCategory } from "@/types";

export const fitness: FlowCategory = {
  id: "fitness",
  label: "Fitness",
  group: "Fitness",
  levels: {
    1: [
      { word: "push", translation: "empurre" },
      { word: "pull", translation: "puxe" },
      { word: "rest", translation: "descanse" },
      { word: "breathe", translation: "respire" },
      { word: "again", translation: "de novo" },
      { word: "faster", translation: "mais rapido" },
      { word: "slow", translation: "devagar" },
    ],
    2: [
      { word: "stretch", translation: "alongue" },
      { word: "hold", translation: "segure" },
      { word: "lift", translation: "levante" },
      { word: "lower", translation: "abaixe" },
    ],
    3: [
      { word: "Breathe slowly", translation: "respire devagar" },
      { word: "Push one more time", translation: "empurre mais uma vez" },
      { word: "Rest for a moment", translation: "descanse por um momento" },
      { word: "Go faster", translation: "va mais rapido" },
    ],
  },
};
