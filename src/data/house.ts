import type { FlowCategory } from "@/types";

export const house: FlowCategory = {
  id: "house",
  label: "House",
  group: "Daily life",
  levels: {
    1: [
      { word: "door", translation: "porta" },
      { word: "table", translation: "mesa" },
      { word: "bed", translation: "cama" },
      { word: "chair", translation: "cadeira" },
    ],
    2: [
      { word: "window", translation: "janela" },
      { word: "kitchen", translation: "cozinha" },
      { word: "bathroom", translation: "banheiro" },
      { word: "floor", translation: "chao" },
    ],
    3: [
      { word: "Open the door", translation: "abra a porta" },
      { word: "Sit on the chair", translation: "sente na cadeira" },
      { word: "Go to bed", translation: "va para a cama" },
      { word: "Clean the table", translation: "limpe a mesa" },
    ],
  },
};
