import { describe, expect, it } from "vitest";
import { dimensions, emptyAnswers, type Attempt } from "../src/model";
import { competitionQuestions, virtualQuestions } from "../src/questions";
import {
  buildPrompt,
  evaluate,
  mergeLearningState,
  reviewPriority,
  validateLearningState,
} from "../src/learning";

const question = virtualQuestions[0];
function attempt(): Attempt {
  const answers = emptyAnswers();
  return {
    id: "one",
    question,
    answers,
    evaluations: evaluate(question, answers),
    createdAt: "2026-10-18T00:00:00Z",
    selfRating: 2,
    followup: "定格の確認方法は？",
    revealedStage: 0,
  };
}
describe("conservative assessment and review", () => {
  it("rejects tampered full marks and malformed source snapshots", () => {
    const tampered = attempt();
    tampered.evaluations[0].points = 20;
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        attempts: [tampered],
        favorites: [],
      }),
    ).toThrow();
    const malformed = JSON.parse(JSON.stringify(attempt()));
    malformed.question.record = { fields: null };
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        attempts: [malformed],
        favorites: [],
      }),
    ).toThrow();
  });
  it("preserves the requested weights", () =>
    expect(dimensions.map((item) => item.max)).toEqual([20, 25, 20, 20, 15]));
  it("does not reward a keyword list", () => {
    const answers = Object.fromEntries(
      dimensions.map((item) => [
        item.id,
        question.rubric[item.id].topics.flat().join("、"),
      ]),
    ) as ReturnType<typeof emptyAnswers>;
    expect(evaluate(question, answers).every((item) => item.points === 0)).toBe(
      true,
    );
  });
  it("never awards full marks even to keyword-rich explanations", () => {
    const answers = Object.fromEntries(
      dimensions.map((item) => [
        item.id,
        `${question.rubric[item.id].topics.flat().join("、")}。制御周期の余裕が必要なため、実測した最悪値を使い要件との対応を評価します。条件が不明な場合は顧客へ質問して確認し、同一の基板条件で比較・検証します。`,
      ]),
    ) as ReturnType<typeof emptyAnswers>;
    const results = evaluate(question, answers);
    expect(
      results.reduce((sum, item) => sum + item.points, 0),
    ).toBeLessThanOrEqual(60);
    expect(
      results.every(
        (item) =>
          item.points < item.max && item.technicalValidity === "評価不能",
      ),
    ).toBe(true);
  });
  it("accepts a reasoned decision to keep the incumbent", () => {
    const answers = emptyAnswers();
    answers.competition =
      "既存STM32を維持する案を提案します。ソフトの移行コストと再認証リスクが大きいためです。現行品の実測性能とTI候補を同じ条件で比較し、要件を満たしているか検証します。";
    expect(
      evaluate(competitionQuestions[0], answers).find(
        (item) => item.dimension === "competition",
      )!.points,
    ).toBeGreaterThan(0);
  });
  it("includes evidence, uncertainty, answers, evaluations, references and user questions in prompt", () => {
    const prompt = buildPrompt(attempt());
    for (const fragment of [
      "仮想案件",
      "自分の回答",
      "ローカル評価",
      "模範解答",
      "https://www.ti.com/",
      "要再確認項目",
      "定格の確認方法は？",
      "Notionへ貼れる復習ノート",
      "評価不能",
    ])
      expect(prompt).toContain(fragment);
  });
  it("prioritizes practiced weak genres, without claiming wrong answers", () => {
    expect(reviewPriority(question, [])).toBe(-1);
    expect(reviewPriority(question, [attempt()])).toBeGreaterThan(0);
  });
  it("validates exports and merges duplicate IDs without overwriting existing attempts", () => {
    const original = attempt();
    const state = {
      schemaVersion: 1 as const,
      attempts: [original],
      favorites: ["virtual-servo"],
    };
    expect(validateLearningState(JSON.parse(JSON.stringify(state)))).toEqual(
      state,
    );
    const merged = mergeLearningState(state, {
      ...state,
      attempts: [
        { ...original, selfRating: 5 },
        { ...original, id: "two" },
      ],
      favorites: ["other"],
    });
    expect(merged.attempts).toHaveLength(2);
    expect(merged.attempts[0].selfRating).toBe(2);
    expect(merged.favorites).toEqual(["virtual-servo", "other"]);
  });
  it("rejects malformed and future-version imports", () => {
    expect(() =>
      validateLearningState({ schemaVersion: 2, attempts: [], favorites: [] }),
    ).toThrow();
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        attempts: [{ ...attempt(), answers: null }],
        favorites: [],
      }),
    ).toThrow();
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        attempts: [attempt(), attempt()],
        favorites: [],
      }),
    ).toThrow();
  });
});
