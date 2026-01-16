import { flowCategories, flowCategoryMap } from "@/data";
import type { FlowCategory, FlowDifficulty, FlowItem, FlowSettings } from "@/types";

export const defaultFlowSettings: FlowSettings = {
  categoryId: "numbers",
  difficulty: "basic",
  level: 1,
  duration: 30,
  intervalSeconds: 2,
  restDuration: 10,
  learningMode: false,
  learningPattern: "block",
  learningBlockSize: 5,
  voiceGender: "female",
  showTranslation: true,
  showTime: false,
};

export function getCategory(categoryId: string): FlowCategory {
  return flowCategoryMap[categoryId] ?? flowCategories[0];
}

export function getItems(settings: FlowSettings): FlowItem[] {
  return getCategory(settings.categoryId).levels[settings.level];
}

export function getDifficultyDisplayLabel(difficulty: FlowDifficulty): string {
  const labels: Record<FlowDifficulty, string> = {
    basic: "Básico",
    intermediate: "Intermediário",
    advanced: "Avançado",
  };

  return labels[difficulty];
}

export function getItemForStep(items: FlowItem[], step: number): FlowItem {
  return items[(step - 1) % items.length];
}

export function getPracticeItemForStep(
  items: FlowItem[],
  step: number,
  settings: FlowSettings,
): FlowItem {
  if (!settings.learningMode) {
    return getItemForStep(items, step);
  }

  if (settings.learningPattern === "item") {
    const itemStep = Math.floor((step - 1) / 2) + 1;
    return getItemForStep(items, itemStep);
  }

  const blockSize = Math.max(1, Math.min(settings.learningBlockSize, items.length));
  const blockRepeatCount = 2;
  const zeroBasedStep = step - 1;
  const cycleSize = blockSize * blockRepeatCount;
  const blockIndex = Math.floor(zeroBasedStep / cycleSize);
  const positionInBlock = zeroBasedStep % blockSize;
  const itemStep = blockIndex * blockSize + positionInBlock + 1;

  return getItemForStep(items, itemStep);
}

export function getTotalSteps(duration: number, intervalSeconds: number): number {
  return Math.max(1, Math.floor(duration / intervalSeconds));
}
