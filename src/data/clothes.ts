import type { FlowCategory } from "@/types";

export const clothes: FlowCategory = {
  id: "clothes",
  label: "Clothes",
  group: "Daily life",
  levels: {
    1: [
      { word: "shirt", translation: "camisa" },
      { word: "shoes", translation: "sapatos" },
      { word: "pants", translation: "calca" },
      { word: "jacket", translation: "jaqueta" },
    ],
    2: [
      { word: "dress", translation: "vestido" },
      { word: "socks", translation: "meias" },
      { word: "hat", translation: "chapeu" },
      { word: "belt", translation: "cinto" },
    ],
    3: [
      { word: "Put on your shoes", translation: "coloque seus sapatos" },
      { word: "Where is my shirt?", translation: "onde esta minha camisa?" },
      { word: "Take off the jacket", translation: "tire a jaqueta" },
      { word: "I need pants", translation: "eu preciso de calca" },
    ],
  },
};
