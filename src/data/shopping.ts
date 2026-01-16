import type { FlowCategory } from "@/types";

export const shopping: FlowCategory = {
  id: "shopping",
  label: "Shopping",
  group: "Real life",
  levels: {
    1: [
      { word: "buy", translation: "comprar" },
      { word: "pay", translation: "pagar" },
      { word: "price", translation: "preco" },
      { word: "card", translation: "cartao" },
    ],
    2: [
      { word: "receipt", translation: "recibo" },
      { word: "discount", translation: "desconto" },
      { word: "cash", translation: "dinheiro" },
      { word: "size", translation: "tamanho" },
    ],
    3: [
      { word: "How much is it?", translation: "quanto custa?" },
      { word: "I will pay by card", translation: "vou pagar com cartao" },
      { word: "I need a receipt", translation: "preciso de um recibo" },
      { word: "Do you have this size?", translation: "voce tem este tamanho?" },
    ],
  },
};
