const categoryLabels: Record<string, string> = {
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
};

const groupLabels: Record<string, string> = {
  Basic: "Básico",
  "Daily life": "Vida diária",
  Actions: "Ações",
  "Real life": "Vida real",
  Work: "Trabalho",
  Emotions: "Emoções",
  Fitness: "Treino",
  "Short phrases": "Frases curtas",
};

export function getCategoryDisplayLabel(categoryId: string, fallback: string) {
  return categoryLabels[categoryId] ?? fallback;
}

export function getGroupDisplayLabel(group: string) {
  return groupLabels[group] ?? group;
}
