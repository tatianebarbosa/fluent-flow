import type { FlowCategory } from "@/types";

export const work: FlowCategory = {
  id: "work",
  label: "Work",
  group: "Work",
  levels: {
    1: [
      { word: "meeting", translation: "reuniao" },
      { word: "task", translation: "tarefa" },
      { word: "project", translation: "projeto" },
      { word: "send", translation: "enviar" },
      { word: "reply", translation: "responder" },
      { word: "schedule", translation: "agendar" },
    ],
    2: [
      { word: "deadline", translation: "prazo" },
      { word: "report", translation: "relatorio" },
      { word: "feedback", translation: "retorno" },
      { word: "update", translation: "atualizacao" },
    ],
    3: [
      { word: "Send the report", translation: "envie o relatorio" },
      { word: "Reply to the email", translation: "responda o email" },
      { word: "Schedule a meeting", translation: "agende uma reuniao" },
      { word: "Update the project", translation: "atualize o projeto" },
    ],
  },
};
