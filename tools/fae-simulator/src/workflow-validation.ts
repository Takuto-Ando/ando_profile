import {
  comparisonMetrics,
  type ExternalReview,
  type WorkflowState,
} from "./workflow-model";
import { validDate } from "./workflow";

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
function citation(value: unknown) {
  return (
    object(value) &&
    ["url", "excerpt", "checkedAt"].every(
      (key) => typeof value[key] === "string",
    ) &&
    typeof value.reviewed === "boolean"
  );
}
function claim(value: unknown) {
  return (
    object(value) && typeof value.value === "string" && citation(value.citation)
  );
}
export function validateWorkflow(
  value: unknown,
): asserts value is WorkflowState {
  if (
    !object(value) ||
    value.version !== 1 ||
    !object(value.profile) ||
    value.profile.version !== 1 ||
    typeof value.profile.fictional !== "boolean" ||
    !Array.isArray(value.profile.requirements) ||
    !Array.isArray(value.profile.topics) ||
    !Array.isArray(value.interview) ||
    !object(value.entries) ||
    !object(value.products) ||
    typeof value.products.ti !== "string" ||
    typeof value.products.competitor !== "string" ||
    !object(value.comparison) ||
    !["switch", "keep", "defer"].includes(value.decision as string) ||
    typeof value.rationale !== "string" ||
    typeof value.counterActive !== "boolean" ||
    !strings(value.uncheckedAtProposal) ||
    !(
      value.proposalStartedAt === null ||
      (typeof value.proposalStartedAt === "string" &&
        validDate(value.proposalStartedAt))
    )
  )
    throw new Error("学習フローの形式が不正です");
  const requirement = (item: unknown) =>
    object(item) &&
    ["id", "label", "topicId", "context"].every(
      (key) => typeof item[key] === "string",
    ) &&
    typeof item.critical === "boolean" &&
    typeof item.public === "boolean" &&
    ["maximum", "minimum", "coverage", "interface", "manual"].includes(
      item.kind as string,
    ) &&
    ["scenario", "unknown"].includes(item.source as string) &&
    (item.min === undefined ||
      (typeof item.min === "number" && Number.isFinite(item.min))) &&
    (item.max === undefined ||
      (typeof item.max === "number" && Number.isFinite(item.max))) &&
    (item.unit === undefined || typeof item.unit === "string") &&
    (item.interfaces === undefined || strings(item.interfaces));
  if (
    !value.profile.requirements.every(requirement) ||
    !value.profile.topics.every(
      (topic) =>
        object(topic) &&
        ["id", "label", "question", "answer"].every(
          (key) => typeof topic[key] === "string",
        ) &&
        strings(topic.keywords) &&
        typeof topic.known === "boolean" &&
        typeof topic.importance === "number" &&
        topic.importance >= 1 &&
        topic.importance <= 3,
    ) ||
    !(
      value.profile.counter === null ||
      (object(value.profile.counter) &&
        typeof value.profile.counter.message === "string" &&
        requirement(value.profile.counter.requirement))
    )
  )
    throw new Error("案件条件の形式が不正です");
  const state = value as unknown as WorkflowState;
  const requirements = [
    ...state.profile.requirements,
    ...(state.counterActive && state.profile.counter
      ? [state.profile.counter.requirement]
      : []),
  ];
  const ids = requirements.map((item) => item.id);
  if (
    new Set(ids).size !== ids.length ||
    (state.counterActive && !state.profile.counter) ||
    !state.interview.every(
      (item) =>
        object(item) &&
        ["id", "question", "answer", "askedAt"].every(
          (key) => typeof item[key as keyof typeof item] === "string",
        ) &&
        validDate(item.askedAt as string) &&
        strings(item.topicIds) &&
        item.topicIds.every((id) =>
          state.profile.topics.some((topic) => topic.id === id),
        ),
    ) ||
    !ids.every((id) => {
      const entry = state.entries[id];
      return (
        object(entry) &&
        ["confirmed", "unknown", "assumed"].includes(
          entry.knowledge as string,
        ) &&
        typeof entry.notes === "string" &&
        claim(entry.ti) &&
        claim(entry.competitor)
      );
    }) ||
    !comparisonMetrics.every((metric) => {
      const comparison = state.comparison[metric.id];
      return (
        object(comparison) &&
        claim(comparison.ti) &&
        claim(comparison.competitor)
      );
    }) ||
    !state.uncheckedAtProposal.every(
      (id) =>
        ids.includes(id) ||
        state.profile.topics.some((topic) => topic.id === id),
    )
  )
    throw new Error("ヒアリング・設計入力の形式が不正です");
}
export function validateReview(
  input: unknown,
  attemptId: string,
  importedAt = new Date().toISOString(),
): ExternalReview {
  if (
    !object(input) ||
    input.schemaVersion !== 1 ||
    input.attemptId !== attemptId ||
    input.source !== "ChatGPT" ||
    typeof input.content !== "string" ||
    !input.content.trim() ||
    input.content.length > 100000 ||
    typeof input.reviewedAt !== "string" ||
    !validDate(input.reviewedAt)
  )
    throw new Error("レビューJSONの形式・回答ID・確認日を確認してください");
  return {
    id: crypto.randomUUID(),
    attemptId,
    source: "ChatGPT",
    content: input.content,
    reviewedAt: input.reviewedAt,
    importedAt,
  };
}
export function validateStoredReviews(input: unknown, attemptId: string) {
  if (!Array.isArray(input) || input.length > 1000)
    throw new Error("レビュー履歴が不正です");
  const ids = new Set<string>();
  for (const review of input) {
    if (
      !object(review) ||
      typeof review.id !== "string" ||
      ids.has(review.id) ||
      typeof review.importedAt !== "string" ||
      !validDate(review.importedAt)
    )
      throw new Error("レビュー履歴が不正です");
    validateReview({ ...review, schemaVersion: 1 }, attemptId);
    ids.add(review.id);
  }
}
export function stableJson(input: unknown) {
  return JSON.stringify(input, (_key, value) =>
    object(value)
      ? Object.fromEntries(
          Object.entries(value).sort(([first], [second]) =>
            first.localeCompare(second),
          ),
        )
      : value,
  );
}
