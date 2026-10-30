export type CheckStatus = "confirmed" | "unverified" | "failed";
export const checkLabels: Record<CheckStatus, string> = {
  confirmed: "成立確認済み（入力根拠の範囲）",
  unverified: "未検証",
  failed: "不成立",
};
export type Citation = {
  url: string;
  excerpt: string;
  checkedAt: string;
  reviewed: boolean;
};
export const emptyCitation = (): Citation => ({
  url: "",
  excerpt: "",
  checkedAt: "",
  reviewed: false,
});
export type Requirement = {
  id: string;
  label: string;
  topicId: string;
  critical: boolean;
  public: boolean;
  kind: "maximum" | "minimum" | "coverage" | "interface" | "manual";
  min?: number;
  max?: number;
  unit?: string;
  interfaces?: string[];
  source: "scenario" | "unknown";
  context: string;
};
export type InterviewTopic = {
  id: string;
  label: string;
  question: string;
  keywords: string[];
  answer: string;
  importance: number;
  known: boolean;
};
export type CaseProfile = {
  version: 1;
  fictional: boolean;
  requirements: Requirement[];
  topics: InterviewTopic[];
  counter: { message: string; requirement: Requirement } | null;
};
export type CandidateKey = "ti" | "competitor";
export type DesignClaim = { value: string; citation: Citation };
export type RequirementEntry = {
  knowledge: "confirmed" | "unknown" | "assumed";
  notes: string;
  ti: DesignClaim;
  competitor: DesignClaim;
};
export const comparisonMetrics = [
  { id: "bom", label: "BOM（通貨・数量条件を明記）" },
  { id: "migration", label: "移行工数（時間・対象範囲）" },
  { id: "risk", label: "開発リスク（検証・認証・ソフト）" },
  { id: "supply", label: "供給条件（見積日・数量・納期）" },
] as const;
export type ComparisonMetric = (typeof comparisonMetrics)[number]["id"];
export type WorkflowState = {
  version: 1;
  profile: CaseProfile;
  interview: {
    id: string;
    question: string;
    topicIds: string[];
    answer: string;
    askedAt: string;
  }[];
  entries: Record<string, RequirementEntry>;
  proposalStartedAt: string | null;
  uncheckedAtProposal: string[];
  counterActive: boolean;
  decision: "switch" | "keep" | "defer";
  rationale: string;
  products: Record<CandidateKey, string>;
  comparison: Record<ComparisonMetric, Record<CandidateKey, DesignClaim>>;
};
export type TechnicalCheck = {
  requirementId: string;
  candidate: CandidateKey;
  label: string;
  status: CheckStatus;
  fatal: boolean;
  expected: string;
  observed: string;
  reason: string;
};
export const errorLabels = {
  technical: "技術条件違反",
  hearing: "要件聞き漏れ",
  evidence: "根拠不足",
  competition: "競合比較不足",
  migration: "移行コスト無視",
} as const;
export type ErrorCategory = keyof typeof errorLabels;
export type TechnicalAssessment = {
  engineVersion: 1;
  status: CheckStatus;
  checks: TechnicalCheck[];
  omissions: string[];
  unresolved: string[];
  coveredTopicIds: string[];
  hearingCoverage: number;
  scoreCap: number;
  errors: ErrorCategory[];
  decisionFeedback: string;
};
export type ExternalReview = {
  id: string;
  attemptId: string;
  source: "ChatGPT";
  content: string;
  reviewedAt: string;
  importedAt: string;
};
