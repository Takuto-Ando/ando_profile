import { describe, expect, it } from "vitest";
import { decisionQuestions } from "../src/decision-questions";
import { shortQuestions as legacyQuestions } from "../src/short-questions";
import { bundledIcLibrary } from "../src/bundled-ic";
import { icCases, icDomain } from "../src/ic-reference";
import {
  buildShortPrompt,
  gradeShort,
  learningProgress,
  revealedChoices,
  shortPool,
  shortSession,
  shortRetryQuestion,
  validateShortAttempts,
} from "../src/short-learning";
import type { ShortAttempt, ShortQuestion } from "../src/short-model";

function answer(question: ShortQuestion): ShortAttempt {
  const answers = {
    selection: question.selection.correctId,
    reason: question.reason?.correctId ?? null,
    proposal:
      question.level === 3
        ? "入力から処理・出力へ構成し、未確認の電圧と遅延を顧客へ確認します。"
        : "",
  };
  return {
    id: question.id,
    question,
    answers,
    result: gradeShort(question, answers),
    hintsUsed: 0,
    solutionHintUsed: true,
    selfAssessment: "unrated",
    createdAt: "2026-10-20T00:00:00Z",
  };
}

describe("customer-led technical decisions", () => {
  it("progresses the same technical scenarios through all three formats without part recall", () => {
    expect(
      new Set(decisionQuestions.map((question) => question.theme)).size,
    ).toBe(7);
    for (const question of decisionQuestions) {
      expect(
        decisionQuestions
          .filter((candidate) => candidate.conceptId === question.conceptId)
          .map((candidate) => candidate.level),
      ).toEqual([1, 2, 3]);
      expect(question.selection.options).toHaveLength(4);
      expect(
        new Set(question.selection.options.map((option) => option.text)).size,
      ).toBe(4);
      expect(question.selection.prompt.length).toBeGreaterThan(40);
      expect(question.customerChecks?.length).toBeGreaterThan(0);
      expect(
        question.selection.prompt +
          question.selection.options.map((option) => option.text).join(" "),
      ).not.toMatch(
        /MSPM0|C2000|Sitara|AM625|ISO7741|INA240|TLV755P|THVD1450|TCAN1042H/,
      );
      expect(question.sources.some((source) => source.localPath)).toBe(true);
      expect(
        question.sources.find((source) => source.localPath)?.sha256,
      ).toMatch(/^[a-f0-9]{64}$/);
      expect(revealedChoices(question, 3)).toHaveLength(2);
      expect(
        revealedChoices(question, 3).some(
          (option) => option.id === question.selection.correctId,
        ),
      ).toBe(true);
      validateShortAttempts([answer(question)]);
      for (const option of question.selection.options) {
        expect(option.explanation.trim().length).toBeGreaterThan(10);
        const attempt = answer(question);
        attempt.answers.selection = option.id;
        expect(gradeShort(question, attempt.answers).selectionCorrect).toBe(
          option.id === question.selection.correctId,
        );
      }
    }
  });
  it("does not resurrect legacy memorization questions or count them as new progress", () => {
    const legacy = answer(legacyQuestions[0]);
    const snapshot = structuredClone(legacy);
    expect(
      shortPool(decisionQuestions, [legacy], 1, "", false).every((question) =>
        question.id.startsWith("decision-"),
      ),
    ).toBe(true);
    expect(
      learningProgress(decisionQuestions, [legacy], [], []).overall.completed,
    ).toBe(0);
    validateShortAttempts([legacy]);
    expect(legacy).toEqual(snapshot);
    const retry = shortRetryQuestion(legacy.question, decisionQuestions)!;
    expect(retry.level).toBe(legacy.question.level);
    expect(retry.theme).toBe(legacy.question.theme);
    expect(retry.id).toMatch(/^decision-/);
    expect(shortRetryQuestion(legacy.question, [])).toBeUndefined();
    expect(
      shortSession(shortPool(decisionQuestions, [], 1, "", false), 1)[0]
        .conceptId,
    ).toBe("decision-node");
  });
  it("records optional solution hints and rejects malformed optional metadata", () => {
    const attempt = answer(decisionQuestions[0]);
    expect(buildShortPrompt(attempt, [attempt])).toContain(
      '"solutionHintUsed": true',
    );
    expect(buildShortPrompt(attempt, [attempt])).toContain("customerChecks");
    expect(() =>
      validateShortAttempts([{ ...attempt, solutionHintUsed: "yes" }]),
    ).toThrow();
    expect(() =>
      validateShortAttempts([
        { ...attempt, question: { ...attempt.question, customerChecks: [42] } },
      ]),
    ).toThrow();
    const old = answer(legacyQuestions[0]);
    delete old.solutionHintUsed;
    validateShortAttempts([old]);
  });
  it("does not erase an unclear Lv.1 attempt when a later level uses the same scenario", () => {
    const first = answer(
      decisionQuestions.find(
        (question) => question.id === "decision-node-lv1",
      )!,
    );
    first.selfAssessment = "unclear";
    const later = answer(
      decisionQuestions.find(
        (question) => question.id === "decision-node-lv3",
      )!,
    );
    expect(
      shortPool(decisionQuestions, [first, later], 1, "", true)[0].id,
    ).toBe(first.question.id);
  });
  it("retains the complete IC reference and source-backed advanced cases", () => {
    expect(bundledIcLibrary.entries).toHaveLength(164);
    expect(icCases(bundledIcLibrary)).toHaveLength(27);
    for (const entry of bundledIcLibrary.entries) {
      expect(
        decisionQuestions.some(
          (question) => question.theme === icDomain(entry).theme,
        ),
      ).toBe(true);
    }
    const keep = decisionQuestions.find(
      (question) => question.id === "decision-incumbent-lv1",
    )!;
    expect(
      keep.selection.options.find(
        (option) => option.id === keep.selection.correctId,
      )?.text,
    ).toContain("現行継続");
  });
});
