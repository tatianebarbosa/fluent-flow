import type { FlowCategory } from "@/types";

export const colors: FlowCategory = {
  id: "colors",
  label: "Colors",
  group: "Basic",
  levels: {
    1: [
      { word: "red", translation: "vermelho" },
      { word: "blue", translation: "azul" },
      { word: "green", translation: "verde" },
      { word: "black", translation: "preto" },
      { word: "white", translation: "branco" },
    ],
    2: [
      { word: "yellow", translation: "amarelo" },
      { word: "purple", translation: "roxo" },
      { word: "gray", translation: "cinza" },
      { word: "brown", translation: "marrom" },
    ],
    3: [
      { word: "It is red", translation: "e vermelho" },
      { word: "The sky is blue", translation: "o ceu e azul" },
      { word: "I like green", translation: "eu gosto de verde" },
      { word: "Use the black one", translation: "use o preto" },
    ],
  },
};
