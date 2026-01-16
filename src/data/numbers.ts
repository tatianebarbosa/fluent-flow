import type { FlowCategory } from "@/types";

export const numbers: FlowCategory = {
  id: "numbers",
  label: "Numbers",
  group: "Basic",
  levels: {
    1: [
      { word: "one", translation: "um" },
      { word: "two", translation: "dois" },
      { word: "three", translation: "tres" },
      { word: "four", translation: "quatro" },
      { word: "five", translation: "cinco" },
      { word: "six", translation: "seis" },
      { word: "seven", translation: "sete" },
      { word: "eight", translation: "oito" },
      { word: "nine", translation: "nove" },
      { word: "ten", translation: "dez" },
    ],
    2: [
      { word: "eleven", translation: "onze" },
      { word: "twelve", translation: "doze" },
      { word: "thirteen", translation: "treze" },
      { word: "fourteen", translation: "quatorze" },
      { word: "fifteen", translation: "quinze" },
    ],
    3: [
      { word: "I have one", translation: "eu tenho um" },
      { word: "Count to five", translation: "conte ate cinco" },
      { word: "Give me two", translation: "me de dois" },
      { word: "Three more", translation: "mais tres" },
    ],
  },
};
