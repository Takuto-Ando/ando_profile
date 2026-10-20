import { describe, expect, it } from "vitest";
import {
  curriculumRegistry,
  importedQuestions,
  industrialDrills,
} from "../src/curriculum";
import {
  icSelectionQuestions,
  icInputCompatibility,
} from "../src/ic-exercises";
import { bundledIcLibrary } from "../src/bundled-ic";
import { bundledNotion } from "../src/bundled-notion";
import { gradeShort, validateShortAttempts } from "../src/short-learning";
import { reverseQuestions } from "../src/questions";
import { scopeCount, caseInScope } from "../src/scope-counts";

describe("unified curriculum", () => {
  it("counts only playable unique forms, excludes pending references, and keeps case scopes separate", () => {
    const cases = reverseQuestions(bundledNotion);
    expect(scopeCount(importedQuestions, cases, "digital")).toBe(35);
    expect(scopeCount(importedQuestions, cases, "analog")).toBe(40);
    expect(scopeCount(importedQuestions, cases, "block")).toBe(43);
    expect(scopeCount(importedQuestions, cases, "product")).toBe(122);
    expect(scopeCount(importedQuestions, cases, "seminar")).toBe(75);
    expect(scopeCount(importedQuestions, cases, "industrial")).toBe(0);
    expect(scopeCount(importedQuestions, cases, "taxonomy")).toBe(122);
    expect(scopeCount(importedQuestions, cases, "psds")).toBe(40);
    expect(
      scopeCount([...importedQuestions, ...importedQuestions], cases, ""),
    ).toBe(importedQuestions.length + cases.length);
    expect(caseInScope(cases[0], "digital")).toBe(false);
    expect(caseInScope(cases[0], "customer")).toBe(true);
  });
  it("accounts for all fixed sources without counting the combined seminar twice", () => {
    expect(curriculumRegistry.report).toEqual({
      rawFixed: 493,
      unique: 397,
      duplicates: 218,
      ready: 240,
      review: 157,
    });
    expect(curriculumRegistry.sources).toHaveLength(14);
    expect(curriculumRegistry.questions).toHaveLength(397);
    expect(new Set(importedQuestions.map((question) => question.id)).size).toBe(
      importedQuestions.length,
    );
    for (const source of curriculumRegistry.sources)
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(
      curriculumRegistry.questions.filter((question) =>
        question.sourceIds.includes("seminar"),
      ),
    ).toHaveLength(218);
    expect(
      curriculumRegistry.questions
        .filter((question) => question.status === "review")
        .every((question) => question.reviewReason),
    ).toBe(true);
    expect(
      importedQuestions.some((question) => question.id.includes("-term-")),
    ).toBe(false);
  });
  it("uses the same grading and history snapshots for IC, block and source questions", () => {
    for (const question of [
      ...importedQuestions,
      ...icSelectionQuestions(bundledIcLibrary),
    ]) {
      const answers = {
        selection: question.selection.correctId,
        reason: question.reason?.correctId ?? null,
        proposal:
          question.level === 3
            ? "仕様と前段・後段を照合し、温度と過渡条件を追加確認する。"
            : "",
      };
      const result = gradeShort(question, answers);
      expect(result.selectionCorrect).toBe(true);
      validateShortAttempts([
        {
          id: question.id,
          question,
          answers,
          result,
          hintsUsed: 0,
          selfAssessment: "unrated",
          createdAt: "2026-10-20T00:00:00Z",
        },
      ]);
      expect(question.selection.options).toHaveLength(4);
      expect(
        new Set(question.selection.options.map((option) => option.text)).size,
      ).toBe(4);
      expect(question.sources.length).toBeGreaterThan(0);
    }
    expect(
      importedQuestions.some(
        (question) =>
          question.kind === "block-diagram" && question.blockDiagram,
      ),
    ).toBe(true);
    expect(industrialDrills).toHaveLength(6);
  });
  it("rejects fatal input mismatches, accepts boundaries only as candidates, and leaves unknowns unverified", () => {
    expect(icInputCompatibility("TLV62090", 2.5, 5.5)).toBe("candidate");
    expect(icInputCompatibility("TLV62090", 2.49, 5.5)).toBe("incompatible");
    expect(icInputCompatibility("TLV62090", 5.5, 5.51)).toBe("incompatible");
    expect(icInputCompatibility("TLV62090", 24, 24)).toBe("incompatible");
    expect(icInputCompatibility("TPS2121", 22, 22)).toBe("candidate");
    expect(icInputCompatibility("TPS2121", 24, 24)).toBe("incompatible");
    expect(icInputCompatibility("UNKNOWN", 3, 5)).toBe("unverified");
    expect(icInputCompatibility("DP83826", 3.3, 3.3)).toBe("unverified");
    expect(icInputCompatibility("TLV62090", 5, 3)).toBe("unverified");
    const question = icSelectionQuestions(bundledIcLibrary).find(
      (item) => item.id === "ic-selection-24v-lv1",
    )!;
    expect(question.selection.correctId).toBe("ask");
    expect(
      gradeShort(question, {
        selection: "TLV62090",
        reason: null,
        proposal: "",
      }).selectionCorrect,
    ).toBe(false);
    for (const candidate of question.icSelection!.candidates) {
      expect(
        bundledIcLibrary.entries.some(
          (entry) => entry.partNumber === candidate.partNumber,
        ),
      ).toBe(true);
      expect(candidate.confidence).toContain("未確認");
      expect(candidate.datasheetUrl).toMatch(/^https:\/\/www\.ti\.com\/lit\//);
    }
  });
  it("bundles anonymized Notion cases without publishing raw customer data or inventing adoption reasons", () => {
    expect(bundledNotion.records).toHaveLength(83);
    expect(reverseQuestions(bundledNotion)).toHaveLength(83);
    expect(
      new Set(
        bundledNotion.records.map((record) =>
          record.fields.partNumbers.value.split(" / ").sort().join("|"),
        ),
      ).size,
    ).toBe(83);
    for (const record of bundledNotion.records) {
      expect(record.fields.customer.value).toBe("匿名（非公開）");
      expect(record.fields.adoptionReason.value).toBe("");
      expect(record.fields.challenge.confidence).toBe("unknown");
      expect(record.attachments).toEqual([]);
      expect(record.sourceUrls).toEqual([]);
      expect(
        record.sources.every(
          (source) => source.path === "notion-export / 匿名化教材",
        ),
      ).toBe(true);
      expect(Object.keys(record.properties)).toEqual([
        "採用確認",
        "原典確認日",
      ]);
    }
  });
});
