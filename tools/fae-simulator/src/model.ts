import type {
  ExternalReview,
  TechnicalAssessment,
  WorkflowState,
} from "./workflow-model";
import type { CaseEvidence } from "./evidence";
import type { ShortAttempt } from "./short-model";

export type Confidence = "recorded" | "inferred" | "unknown";
export const confidenceLabels: Record<Confidence, string> = {
  recorded: "記載確認（外部未検証）",
  inferred: "推定・仮説（元記述を含む）",
  unknown: "未確認・不明",
};
export type FieldName =
  | "customer"
  | "application"
  | "industry"
  | "products"
  | "partNumbers"
  | "challenge"
  | "adoptionReason"
  | "competitors"
  | "priority";
export type Evidence = { value: string; confidence: Confidence; basis: string };
export type Source = {
  path: string;
  sha256: string;
  format: string;
  locator: string;
};
export type CaseRecord = {
  id: string;
  title: string;
  fields: Record<FieldName, Evidence>;
  properties: Record<string, string>;
  body: string;
  sourceUrls: string[];
  sources: Source[];
  attachments: string[];
  duplicateOf?: string;
};
export type ImportReport = {
  files: Record<string, number>;
  csvTables: {
    path: string;
    rows: number;
    columns: string[];
    missing: Record<string, number>;
  }[];
  records: number;
  eligible: number;
  missing: Record<string, number>;
  confidence: Record<string, number>;
  duplicateGroups: string[][];
  warnings: string[];
};
export type Dataset = {
  schemaVersion: 1;
  importedAt: string;
  records: CaseRecord[];
  attachments: { path: string; bytes: number; sha256: string }[];
  report: ImportReport;
};
export const categories = [
  "MCU",
  "Processor",
  "リアルタイム制御",
  "産業通信",
  "電源",
  "アナログ",
  "絶縁",
  "保護",
  "車載",
  "無線",
  "競合比較",
  "システム設計",
] as const;
export type Category = (typeof categories)[number];
export type Dimension =
  "requirements" | "architecture" | "selection" | "competition" | "proposal";
export const dimensions: {
  id: Dimension;
  label: string;
  max: number;
  prompt: string;
}[] = [
  {
    id: "requirements",
    label: "要件把握",
    max: 20,
    prompt: "クリティカルな課題、定量目標、不足情報と顧客への確認事項",
  },
  {
    id: "architecture",
    label: "システム構成",
    max: 25,
    prompt: "入力 → 処理 → 出力のブロック、電源・通信・保護、安全と検証方法",
  },
  {
    id: "selection",
    label: "TI製品選定",
    max: 20,
    prompt: "候補のTI型番／製品群、要件との対応、制約、データシート照合項目",
  },
  {
    id: "competition",
    label: "競合比較",
    max: 20,
    prompt: "他社候補、比較条件、移行リスク。TIへ置換しない判断も可",
  },
  {
    id: "proposal",
    label: "顧客への提案力",
    max: 15,
    prompt: "採用条件、PoC・評価基準、日程、意思決定者、商談の次の一手",
  },
];
export type Answers = Record<Dimension, string>;
export const emptyAnswers = (): Answers => ({
  requirements: "",
  architecture: "",
  selection: "",
  competition: "",
  proposal: "",
});
export type Rubric = Record<
  Dimension,
  { topics: string[][]; expected: string }
>;
export type Question = {
  id: string;
  mode: "virtual" | "reverse" | "competition";
  title: string;
  category: Category[];
  difficulty: 1 | 2 | 3;
  brief: string;
  stages: string[];
  rubric: Rubric;
  reference: string;
  urls: string[];
  record?: CaseRecord;
};
export type Evaluation = {
  dimension: Dimension;
  points: number;
  max: number;
  matched: string[];
  missing: string[];
  explanation: string;
  technicalValidity: "評価不能";
};
export type Attempt = {
  id: string;
  question: Question;
  answers: Answers;
  evaluations: Evaluation[];
  createdAt: string;
  selfRating: number;
  followup: string;
  revealedStage: number;
  workflow?: WorkflowState;
  assessment?: TechnicalAssessment;
  externalReviews?: ExternalReview[];
  notionEvidence?: CaseEvidence;
  learningLevel?: 4 | 5;
};
export type LearningState = {
  schemaVersion: 1;
  attempts: Attempt[];
  favorites: string[];
  shortAttempts?: ShortAttempt[];
};
