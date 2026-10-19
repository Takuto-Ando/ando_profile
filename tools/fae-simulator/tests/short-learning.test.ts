import { describe, expect, it } from "vitest";
import { shortQuestions } from "../src/short-questions";
import {
  advancedPool,
  buildShortPrompt,
  gradeShort,
  levelInfo,
  nextHint,
  relatedCases,
  revealedChoices,
  shortCorrect,
  shortPool,
  shortPriority,
  shortSession,
  validateShortAttempts,
} from "../src/short-learning";
import {
  themes,
  type ShortAttempt,
  type ShortQuestion,
} from "../src/short-model";
import { emptyAnswers, type Attempt, type LearningState } from "../src/model";
import {
  competitionQuestions,
  reverseQuestions,
  virtualQuestions,
} from "../src/questions";
import {
  buildPrompt,
  evaluate,
  mergeLearningState,
  validateLearningState,
} from "../src/learning";
import { importFiles } from "../src/importer";

function attempt(question = shortQuestions[0], correct = true): ShortAttempt {
  const answers = {
    selection: correct
      ? question.selection.correctId
      : question.selection.options.find(
          (option) => option.id !== question.selection.correctId,
        )!.id,
    reason: question.reason?.correctId ?? null,
    proposal:
      question.level === 3
        ? "候補の機能と入力を対応付けます。電源と精度条件を確認します。"
        : "",
  };
  return {
    id: `test-${question.id}`,
    createdAt: "2026-10-19T00:00:00Z",
    question: structuredClone(question),
    answers,
    result: gradeShort(question, answers),
    hintsUsed: 0,
    selfAssessment: "unrated",
  };
}
function legacy(): Attempt {
  const answers = emptyAnswers();
  return {
    id: "legacy",
    question: virtualQuestions[0],
    answers,
    evaluations: evaluate(virtualQuestions[0], answers),
    createdAt: "2026-10-18T00:00:00Z",
    selfRating: 2,
    followup: "旧履歴を保持",
    revealedStage: 0,
  };
}

describe("structured short question quality", () => {
  it("has all seven themes with Lv.1–3 progression and valid four-choice snapshots", () => {
    expect(new Set(shortQuestions.map((question) => question.id)).size).toBe(
      shortQuestions.length,
    );
    for (const theme of themes) {
      for (const level of [1, 2, 3])
        expect(
          shortQuestions.some(
            (question) =>
              question.theme === theme.id && question.level === level,
          ),
        ).toBe(true);
    }
    for (const question of shortQuestions) {
      validateShortAttempts([attempt(question)]);
      expect(question.selection.options).toHaveLength(4);
      expect(question.sources.length).toBeGreaterThan(0);
      for (const source of question.sources) {
        if (source.url.includes("/product/")) {
          expect(source.datasheet?.partNumber).toBeTruthy();
          expect(source.datasheet?.revision).toBeTruthy();
          expect(source.datasheet?.url).toMatch(
            /^https:\/\/www\.ti\.com\/lit\/gpn\//,
          );
        }
      }
      expect(question.basic.length).toBeLessThan(160);
      expect(
        relatedCases(question, [...virtualQuestions, ...competitionQuestions])
          .length,
      ).toBeGreaterThan(0);
    }
  });
  it("does not put every correct choice in the same position", () => {
    expect(
      new Set(
        shortQuestions.map((question) =>
          question.selection.options.findIndex(
            (option) => option.id === question.selection.correctId,
          ),
        ),
      ).size,
    ).toBe(4);
  });
  it.each([1, 2, 3] as const)(
    "grades Lv.%i choice correctness without negative points",
    (level) => {
      const question = shortQuestions.find(
        (question) => question.level === level,
      )!;
      const correct = attempt(question);
      const wrong = attempt(question, false);
      expect(shortCorrect(correct)).toBe(true);
      expect(shortCorrect(wrong)).toBe(false);
      expect(correct.result).not.toHaveProperty("points");
      expect(wrong.result).not.toHaveProperty("penalty");
    },
  );
  it("requires the Lv.2 reason, and detects wrong reasons separately", () => {
    const record = attempt(
      shortQuestions.find((question) => question.level === 2)!,
    );
    expect(() =>
      gradeShort(record.question, { ...record.answers, reason: null }),
    ).toThrow();
    const result = gradeShort(record.question, {
      ...record.answers,
      reason: record.question.reason!.options.find(
        (option) => option.id !== record.question.reason!.correctId,
      )!.id,
    });
    expect(result).toEqual({ selectionCorrect: true, reasonCorrect: false });
  });
  it("keeps Lv.1 free of prose and rejects fake/empty choices", () => {
    const record = attempt();
    expect(record.question.reason).toBeUndefined();
    expect(() =>
      gradeShort(record.question, { ...record.answers, selection: "invalid" }),
    ).toThrow();
    expect(() =>
      gradeShort(record.question, { ...record.answers, selection: null }),
    ).toThrow();
    expect(() =>
      gradeShort(record.question, { ...record.answers, proposal: "長文" }),
    ).toThrow();
  });
  it("accepts short Lv.3 proposals without pretending to assess technical truth", () => {
    const record = attempt(
      shortQuestions.find((question) => question.level === 3)!,
    );
    expect(() =>
      gradeShort(record.question, { ...record.answers, proposal: " " }),
    ).toThrow();
    expect(() =>
      gradeShort(record.question, {
        ...record.answers,
        proposal: "a".repeat(1001),
      }),
    ).toThrow();
    const result = gradeShort(record.question, {
      ...record.answers,
      proposal: "未確認です。",
    });
    expect(result.selectionCorrect).toBe(true);
    expect(result).not.toHaveProperty("proposalCorrect");
  });
});

describe("hints, sessions and voluntary level changes", () => {
  it("reveals three bounded hints, retaining exactly two distinct choices including the answer", () => {
    expect([0, 1, 2, 3].map(nextHint)).toEqual([1, 2, 3, 3]);
    for (const question of shortQuestions) {
      expect(revealedChoices(question, 0)).toHaveLength(4);
      expect(revealedChoices(question, 2)).toHaveLength(4);
      expect(revealedChoices(question, 3)).toHaveLength(2);
      expect(revealedChoices(question, 3).map((option) => option.id)).toContain(
        question.selection.correctId,
      );
      const record = attempt(question);
      record.hintsUsed = 3;
      expect(gradeShort(question, record.answers)).toEqual(record.result);
    }
  });
  it.each([1, 3, 5, 10])(
    "creates %i-question sessions without repeats or automatic promotion",
    (count) => {
      const pool = shortPool(shortQuestions, [], 1, "", false);
      const session = shortSession(pool, count);
      expect(session).toHaveLength(count);
      expect(new Set(session.map((question) => question.id)).size).toBe(count);
      expect(session.every((question) => question.level === 1)).toBe(true);
    },
  );
  it("does not inflate a small filtered pool", () => {
    const pool = shortPool(shortQuestions, [], 1, "series", false);
    expect(shortSession(pool, 10)).toHaveLength(pool.length);
    expect(() => shortSession(pool, 7)).toThrow();
    expect(shortSession([], 1)).toEqual([]);
  });
  it("offers the next unseen question instead of restarting the same first question", () => {
    const record = attempt();
    const pool = shortPool(shortQuestions, [record], 1, "", false);
    expect(pool[0].id).not.toBe(record.question.id);
    expect(pool.at(-1)!.id).toBe(record.question.id);
  });
  it("filters freely by level, theme and search, with recommended order", () => {
    expect(shortPool(shortQuestions, [], 1, "", false)[0].conceptId).toBe(
      "mspm0",
    );
    expect(
      shortPool(shortQuestions, [], 2, "power", false).every(
        (question) => question.level === 2 && question.theme === "power",
      ),
    ).toBe(true);
    expect(
      shortPool(shortQuestions, [], 1, "", false, "Sitara").length,
    ).toBeGreaterThan(0);
    expect(shortPool(shortQuestions, [], 1, "", false, "unmatched")).toEqual(
      [],
    );
    expect(shortPool(shortQuestions, [], 5, "", false)).toEqual([]);
    expect(levelInfo(5).time).toBe("約30分");
  });
  it("prioritizes mistakes and uncertainty, including product-category weakness", () => {
    const wrong = attempt(shortQuestions[0], false);
    expect(shortPriority(wrong.question, [wrong])).toBeGreaterThan(0);
    const correct = attempt();
    correct.selfAssessment = "unclear";
    expect(
      shortPool(shortQuestions, [correct], 1, "", true).map(
        (question) => question.id,
      ),
    ).toContain(correct.question.id);
    expect(shortPool(shortQuestions, [], 1, "", true)).toEqual([]);
    expect(
      shortPool(shortQuestions, [wrong], 2, "series", true).length,
    ).toBeGreaterThan(0);
  });
  it("connects the same themes to existing advanced cases", () => {
    for (const theme of themes)
      expect(
        advancedPool(
          [...virtualQuestions, ...competitionQuestions],
          theme.id,
          "",
        ).length,
      ).toBeGreaterThan(0);
    expect(virtualQuestions).toHaveLength(8);
    expect(competitionQuestions).toHaveLength(5);
  });
});

describe("backward compatible history and evidence", () => {
  it("roundtrips old state without adding fields or changing scores", () => {
    const state: LearningState = {
      schemaVersion: 1,
      favorites: ["old"],
      attempts: [legacy()],
    };
    expect(validateLearningState(JSON.parse(JSON.stringify(state)))).toEqual(
      state,
    );
    expect(mergeLearningState(state, state)).toEqual(state);
  });
  it("merges mixed history, retaining existing self-evaluations and old answers", () => {
    const old = legacy();
    const first = attempt();
    first.selfAssessment = "unclear";
    const state: LearningState = {
      schemaVersion: 1,
      favorites: ["old"],
      attempts: [old],
      shortAttempts: [first],
    };
    const imported = {
      ...state,
      shortAttempts: [
        { ...first, selfAssessment: "understood" as const },
        { ...attempt(shortQuestions[1]), id: "new" },
      ],
    };
    const merged = mergeLearningState(state, imported);
    expect(merged.shortAttempts).toHaveLength(2);
    expect(
      merged.shortAttempts!.find((item) => item.id === first.id)
        ?.selfAssessment,
    ).toBe("unclear");
    expect(merged.attempts[0]).toEqual(old);
    expect(validateLearningState(JSON.parse(JSON.stringify(merged)))).toEqual(
      merged,
    );
    expect(
      mergeLearningState(state, {
        schemaVersion: 1,
        favorites: [],
        attempts: [],
      }).shortAttempts,
    ).toEqual([first]);
  });
  it.each([
    "result",
    "duplicates",
    "hints",
    "options",
    "level",
    "self",
    "reason",
    "datasheet",
  ])("rejects malformed short history: %s", (kind) => {
    const record = attempt();
    const records = [record];
    if (kind === "result") record.result.selectionCorrect = false;
    if (kind === "duplicates") records.push(record);
    if (kind === "hints") record.question.hints[2] = ["invalid", "option-3"];
    if (kind === "options")
      record.question.selection.options[1].id =
        record.question.selection.options[0].id;
    if (kind === "level")
      (record.question as unknown as Record<string, unknown>).level = 5;
    if (kind === "self")
      (record as unknown as Record<string, unknown>).selfAssessment =
        "mastered";
    if (kind === "reason") record.answers.reason = "option-0";
    if (kind === "datasheet")
      record.question.sources[0].datasheet!.url = "javascript:alert(1)";
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        attempts: [],
        favorites: [],
        shortAttempts: records,
      }),
    ).toThrow();
  });
  it("accepts Lv.4 without inventing hearing/feasibility, keeps Lv.5 workflow separate", () => {
    const record = { ...legacy(), learningLevel: 4 as const };
    expect(
      validateLearningState({
        schemaVersion: 1,
        favorites: [],
        attempts: [record],
      }).attempts[0].workflow,
    ).toBeUndefined();
    expect(buildPrompt(record)).toContain("Lv.4の提案");
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        favorites: [],
        attempts: [{ ...record, learningLevel: 3 }],
      }),
    ).toThrow();
  });
  it("retains Notion source uncertainty in Lv.3 and in review prompts", async () => {
    const dataset = await importFiles([
      {
        path: "case.csv",
        bytes: new TextEncoder().encode(
          "事業名,会社名,TI製品,課題,TI選定の決め手\nDemo,Customer,MSPM0,精度,推定理由",
        ),
      },
    ]);
    const context = reverseQuestions(dataset)[0];
    expect(context).toBeDefined();
    const record = attempt(
      shortQuestions.find((question) => question.level === 3)!,
    );
    record.question.notionContext = context;
    expect(
      validateLearningState({
        schemaVersion: 1,
        attempts: [],
        favorites: [],
        shortAttempts: [record],
      }).shortAttempts![0].question.notionContext?.record,
    ).toEqual(context.record);
    const prompt = buildShortPrompt(record, [record]);
    for (const fragment of [
      "自分の回答",
      "自己評価",
      "selectionCorrect",
      "Notion",
      "推定理由",
      "未確認",
      "Notionへ貼れる復習ノート",
      "relatedHistory",
      "ヒント利用",
    ])
      expect(prompt).toContain(fragment);
    expect(prompt).toContain("評価不能");
    const invalid = attempt();
    invalid.question.notionContext = context;
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        attempts: [],
        favorites: [],
        shortAttempts: [invalid],
      }),
    ).toThrow();
  });
});
