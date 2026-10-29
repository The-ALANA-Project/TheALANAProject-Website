export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explainer: string;
  isMultiSelect?: boolean;
}

export interface KnowledgeChallengeStep {
  id: number;
  label: string;
  questions: QuizQuestion[];
}
