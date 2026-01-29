export type FlowLevelNumber = 1 | 2 | 3;

export type FlowDifficulty = "basic" | "intermediate" | "advanced";

export type FlowDuration = number;

export type FlowInterval = number;

export type FlowRestDuration = number;

export type LearningPattern = "item" | "block";

export type LearningBlockSize = 3 | 5 | 10;

export type VoiceGender = "female" | "male";

export type AppLanguage = "pt-BR" | "en-US";

export type AppPreferences = {
  language: AppLanguage;
  voiceGender: VoiceGender;
};

export type FlowItem = {
  word: string;
  translation: string;
  image?: string;
};

export type FlowLevel = {
  level: FlowLevelNumber;
  items: FlowItem[];
};

export type FlowCategory = {
  id: string;
  label: string;
  group: string;
  levels: Record<FlowLevelNumber, FlowItem[]>;
};

export type FlowSettings = {
  categoryId: string;
  difficulty: FlowDifficulty;
  level: FlowLevelNumber;
  duration: FlowDuration;
  intervalSeconds: FlowInterval;
  restDuration: FlowRestDuration;
  learningMode: boolean;
  learningPattern: LearningPattern;
  learningBlockSize: LearningBlockSize;
  voiceGender: VoiceGender;
  showTranslation: boolean;
  showTime: boolean;
};
