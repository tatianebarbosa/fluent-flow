import type { FlowCategory } from "@/types";

export const travel: FlowCategory = {
  id: "travel",
  label: "Travel",
  group: "Real life",
  levels: {
    1: [
      { word: "ticket", translation: "passagem" },
      { word: "airport", translation: "aeroporto" },
      { word: "passport", translation: "passaporte" },
      { word: "hotel", translation: "hotel" },
    ],
    2: [
      { word: "luggage", translation: "bagagem" },
      { word: "gate", translation: "portao" },
      { word: "flight", translation: "voo" },
      { word: "reservation", translation: "reserva" },
    ],
    3: [
      { word: "Where is the gate?", translation: "onde fica o portao?" },
      { word: "I need a ticket", translation: "preciso de uma passagem" },
      { word: "Here is my passport", translation: "aqui esta meu passaporte" },
      { word: "I have a reservation", translation: "eu tenho uma reserva" },
    ],
  },
};
