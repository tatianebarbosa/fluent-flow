import type { FlowCategory } from "@/types";

export const verbs: FlowCategory = {
  id: "verbs",
  label: "Verbs / Actions",
  group: "Actions",
  levels: {
    1: [
      { word: "run", translation: "correr" },
      { word: "eat", translation: "comer" },
      { word: "work", translation: "trabalhar" },
      { word: "sleep", translation: "dormir" },
      { word: "go", translation: "ir" },
    ],
    2: [
      { word: "bring", translation: "trazer" },
      { word: "choose", translation: "escolher" },
      { word: "listen", translation: "ouvir" },
      { word: "repeat", translation: "repetir" },
      { word: "remember", translation: "lembrar" },
    ],
    3: [
      { word: "I need to go", translation: "eu preciso ir" },
      { word: "Listen and repeat", translation: "ouca e repita" },
      { word: "I work today", translation: "eu trabalho hoje" },
      { word: "Choose one", translation: "escolha um" },
    ],
  },
};
