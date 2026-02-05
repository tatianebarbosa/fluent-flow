import type { FlowCategory } from "@/types";

export const numbers: FlowCategory = {
  id: "numbers",
  label: "Numbers",
  group: "Basic",
  levels: {
    1: [
      { word: "one", displayWord: "1", translation: "um" },
      { word: "two", displayWord: "2", translation: "dois" },
      { word: "three", displayWord: "3", translation: "tres" },
      { word: "four", displayWord: "4", translation: "quatro" },
      { word: "five", displayWord: "5", translation: "cinco" },
      { word: "six", displayWord: "6", translation: "seis" },
      { word: "seven", displayWord: "7", translation: "sete" },
      { word: "eight", displayWord: "8", translation: "oito" },
      { word: "nine", displayWord: "9", translation: "nove" },
      { word: "ten", displayWord: "10", translation: "dez" },
    ],
    2: [
      { word: "eleven", displayWord: "11", translation: "onze" },
      { word: "twelve", displayWord: "12", translation: "doze" },
      { word: "thirteen", displayWord: "13", translation: "treze" },
      { word: "fourteen", displayWord: "14", translation: "quatorze" },
      { word: "fifteen", displayWord: "15", translation: "quinze" },
    ],
    3: [
      { word: "I have one", translation: "eu tenho um" },
      { word: "Count to five", translation: "conte ate cinco" },
      { word: "Give me two", translation: "me de dois" },
      { word: "Three more", translation: "mais tres" },
    ],
  },
};
