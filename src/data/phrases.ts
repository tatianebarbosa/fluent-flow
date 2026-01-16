import type { FlowCategory } from "@/types";

export const phrases: FlowCategory = {
  id: "phrases",
  label: "Short phrases",
  group: "Short phrases",
  levels: {
    1: [
      { word: "let's go", translation: "vamos la" },
      { word: "come here", translation: "venha aqui" },
      { word: "wait a second", translation: "espere um segundo" },
      { word: "one more", translation: "mais um" },
      { word: "almost done", translation: "quase terminando" },
    ],
    2: [
      { word: "not now", translation: "agora nao" },
      { word: "right here", translation: "bem aqui" },
      { word: "try again", translation: "tente de novo" },
      { word: "very good", translation: "muito bom" },
    ],
    3: [
      { word: "Can you help me?", translation: "voce pode me ajudar?" },
      { word: "I am almost ready", translation: "estou quase pronto" },
      { word: "Let's do one more", translation: "vamos fazer mais um" },
      { word: "Wait a second, please", translation: "espere um segundo, por favor" },
    ],
  },
};
