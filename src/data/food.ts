import type { FlowCategory } from "@/types";

export const food: FlowCategory = {
  id: "food",
  label: "Food",
  group: "Basic",
  levels: {
    1: [
      { word: "apple", translation: "maca" },
      { word: "bread", translation: "pao" },
      { word: "rice", translation: "arroz" },
      { word: "water", translation: "agua" },
    ],
    2: [
      { word: "cheese", translation: "queijo" },
      { word: "chicken", translation: "frango" },
      { word: "coffee", translation: "cafe" },
      { word: "juice", translation: "suco" },
    ],
    3: [
      { word: "I want water", translation: "eu quero agua" },
      { word: "Eat the apple", translation: "coma a maca" },
      { word: "The rice is ready", translation: "o arroz esta pronto" },
      { word: "More bread, please", translation: "mais pao, por favor" },
    ],
  },
};
