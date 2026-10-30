import type { Question } from "./model";
import type { ShortQuestion } from "./short-model";

export function inScope(question: ShortQuestion, scope: string) {
  return (
    !scope ||
    (scope === "customer"
      ? question.sourceIds?.some((id) =>
          ["decision", "ic", "notion", "industrial"].includes(id),
        )
      : question.sourceIds?.includes(scope))
  );
}

export function caseInScope(question: Question, scope: string) {
  if (!scope || scope === "customer") return true;
  if (scope === "ic") return question.id.startsWith("ic-case-");
  if (scope === "notion")
    return question.mode === "reverse" && !question.id.startsWith("ic-case-");
  if (scope === "industrial") return question.id.startsWith("industrial-");
  if (scope === "decision") return !question.id.startsWith("industrial-");
  return false;
}

export function scopeCount(
  short: ShortQuestion[],
  cases: Question[],
  scope: string,
) {
  return (
    new Set(
      short
        .filter((question) => inScope(question, scope))
        .map((question) => question.id),
    ).size +
    new Set(
      cases
        .filter((question) => caseInScope(question, scope))
        .map((question) => question.id),
    ).size
  );
}
