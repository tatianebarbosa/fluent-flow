import type { FlowCategory } from "@/types";

export const animals: FlowCategory = {
  id: "animals",
  label: "Animals",
  group: "Basic",
  levels: {
    1: [
      { word: "dog", translation: "cachorro" },
      { word: "cat", translation: "gato" },
      { word: "bird", translation: "passaro" },
      { word: "fish", translation: "peixe" },
    ],
    2: [
      { word: "horse", translation: "cavalo" },
      { word: "rabbit", translation: "coelho" },
      { word: "duck", translation: "pato" },
      { word: "cow", translation: "vaca" },
    ],
    3: [
      { word: "I see a dog", translation: "eu vejo um cachorro" },
      { word: "The cat is here", translation: "o gato esta aqui" },
      { word: "Feed the fish", translation: "alimente o peixe" },
      { word: "A bird is flying", translation: "um passaro esta voando" },
    ],
  },
};
