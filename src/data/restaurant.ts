import type { FlowCategory } from "@/types";

export const restaurant: FlowCategory = {
  id: "restaurant",
  label: "Restaurant",
  group: "Real life",
  levels: {
    1: [
      { word: "menu", translation: "cardapio" },
      { word: "order", translation: "pedir" },
      { word: "bill", translation: "conta" },
      { word: "water", translation: "agua" },
    ],
    2: [
      { word: "table", translation: "mesa" },
      { word: "waiter", translation: "garcom" },
      { word: "meal", translation: "refeicao" },
      { word: "dessert", translation: "sobremesa" },
    ],
    3: [
      { word: "Can I see the menu?", translation: "posso ver o cardapio?" },
      { word: "I would like water", translation: "eu gostaria de agua" },
      { word: "The bill, please", translation: "a conta, por favor" },
      { word: "I am ready to order", translation: "estou pronto para pedir" },
    ],
  },
};
