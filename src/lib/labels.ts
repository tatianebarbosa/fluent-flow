import type { AppLanguage } from "@/types";

const categoryLabels: Record<AppLanguage, Record<string, string>> = {
  "pt-BR": {
    numbers: "Números",
    colors: "Cores",
    animals: "Animais",
    food: "Comida",
    house: "Casa",
    clothes: "Roupas",
    body: "Corpo",
    verbs: "Verbos / Ações",
    shopping: "Compras",
    restaurant: "Restaurante",
    travel: "Viagem",
    work: "Trabalho",
    emotions: "Emoções",
    fitness: "Treino",
    phrases: "Frases curtas",
  },
  "en-US": {},
};

const groupLabels: Record<AppLanguage, Record<string, string>> = {
  "pt-BR": {
    Basic: "Básico",
    "Daily life": "Vida diária",
    Actions: "Ações",
    "Real life": "Vida real",
    Work: "Trabalho",
    Emotions: "Emoções",
    Fitness: "Treino",
    "Short phrases": "Frases curtas",
  },
  "en-US": {},
};

export function getCategoryDisplayLabel(
  categoryId: string,
  fallback: string,
  language: AppLanguage = "pt-BR",
) {
  return categoryLabels[language][categoryId] ?? fallback;
}

export function getGroupDisplayLabel(
  group: string,
  language: AppLanguage = "pt-BR",
) {
  return groupLabels[language][group] ?? group;
}
