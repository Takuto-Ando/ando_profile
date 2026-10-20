import type { Category, Question } from "./model";

export type LearningLevel = 1 | 2 | 3 | 4 | 5;
export const levels = [
  { level: 1, time: "約1分", label: "顧客課題から技術を選ぶ" },
  { level: 2, time: "約3分", label: "選択と理由" },
  { level: 3, time: "約5分", label: "短い提案" },
  { level: 4, time: "約10〜15分", label: "構成と比較" },
  { level: 5, time: "約30分", label: "ヒアリングと成立性検証" },
] as const;
export const themes = [
  { id: "series", label: "1. 処理構成・制御と用途" },
  { id: "communication", label: "2. 通信" },
  { id: "power", label: "3. 産業用電源" },
  { id: "sensing", label: "4. ADC・センシング・I/O" },
  { id: "protection", label: "5. 絶縁・保護・ノイズ" },
  { id: "system", label: "6. モータ・PLC・センサノード" },
  { id: "designwin", label: "7. 比較とDesign Win" },
] as const;
export type Theme = (typeof themes)[number]["id"];
export type ChoiceTask = {
  prompt: string;
  options: { id: string; text: string; explanation: string }[];
  correctId: string;
};
export type ShortQuestion = {
  id: string;
  conceptId: string;
  level: 1 | 2 | 3;
  theme: Theme;
  category: Category[];
  title: string;
  selection: ChoiceTask;
  reason?: ChoiceTask;
  hints: [string, string, [string, string]];
  basic: string;
  detailed: string;
  customerChecks?: string[];
  solutionCategory?: string;
  relatedProducts: string[];
  sources: {
    url: string;
    section: string;
    checkedAt: string;
    scope: "concept" | "notion" | "reference";
    localPath?: string;
    sha256?: string;
    datasheet?: {
      partNumber: string;
      url: string;
      revision: string;
      section: string;
    };
  }[];
  advancedIds: string[];
  notionContext?: Question;
};
export type ShortAnswers = {
  selection: string | null;
  reason: string | null;
  proposal: string;
};
export type ShortResult = {
  selectionCorrect: boolean;
  reasonCorrect: boolean | null;
};
export type ShortAttempt = {
  id: string;
  question: ShortQuestion;
  answers: ShortAnswers;
  result: ShortResult;
  hintsUsed: number;
  solutionHintUsed?: boolean;
  selfAssessment: "unrated" | "understood" | "unclear";
  createdAt: string;
};
