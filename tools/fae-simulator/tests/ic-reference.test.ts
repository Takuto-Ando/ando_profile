import { describe, expect, it } from "vitest";
import { zipSync, strToU8, unzipSync } from "fflate";
import {
  importIcWorkbook,
  validateIcLibrary,
  icPriority,
  icEligible,
  icCases,
  icShortQuestions,
  icSelectionText,
} from "../src/ic-reference";
import {
  gradeShort,
  validateShortAttempts,
  learningProgress,
} from "../src/short-learning";
import { validateLearningState, buildPrompt, evaluate } from "../src/learning";
import { emptyAnswers } from "../src/model";
import { createWorkflow, assessWorkflow } from "../src/workflow";
import { caseEvidence } from "../src/evidence";
import { bundledIcLibrary } from "../src/bundled-ic";

it("bundles the approved 164-IC workbook with provenance and conservative learning rules", () => {
  expect(bundledIcLibrary.entries).toHaveLength(164);
  expect(bundledIcLibrary.source.sha256).toBe(
    "3ef94f118aabfd40ddcce95ff7649ecebddb8e351e17856e4186860bfdf5e1fd",
  );
  expect(icCases(bundledIcLibrary)).toHaveLength(27);
  expect(icShortQuestions(bundledIcLibrary)).toHaveLength(54);
  expect(
    bundledIcLibrary.entries.filter((entry) => !entry.adoptionExample),
  ).toHaveLength(58);
});

const masterHeaders = [
  "型番",
  "分類",
  "採用先の例",
  "証拠レベル",
  "情報源の種類",
  "シミュレータ利用",
  "注意事項",
];
const detailHeaders = [
  "型番",
  "正式な分類・製品種別",
  "役割・何をするか",
  "信号・接続インターフェース",
  "回路設計で確認するポイント",
  "採用先の例（元データ）",
  "採用証拠レベル（元データ）",
  "シミュレータ扱い",
  "説明の確度",
  "TI製品ページ候補URL",
  "FAE練習問題の観点",
  "検証上の注意",
  "主要仕様（確認済のみ）",
];
const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
function workbook({
  prefix = "x:",
  shared = false,
  duplicate = false,
  mismatch = false,
  formula = false,
  badHeader = false,
} = {}) {
  const masters = [masterHeaders];
  const details = [badHeader ? ["型番"] : detailHeaders];
  for (let index = 0; index < 6; index += 1) {
    const part = duplicate && index === 1 ? "TEST0" : `TEST${index}`;
    const evidence =
      index < 4
        ? "A_公式資料（型番対応あり）"
        : index === 4
          ? "B_分解資料報告"
          : "D_既存DB記載・個別未検証";
    const customer = index === 5 ? "" : `架空装置${index}`;
    masters.push([
      part,
      "テスト分類",
      customer,
      evidence,
      "テスト資料",
      index < 5 ? "verified_case" : "candidate_only",
      "原典未確認",
    ]);
    details.push([
      part,
      index === 0 ? "産業用テストMCU" : "テスト製品",
      `架空の役割${index}`,
      "要確認",
      "電源・I/Fを照合",
      customer || "採用先未特定",
      mismatch ? "D_異なるラベル" : evidence,
      index < 5 ? "verified_case" : "candidate_only",
      index === 4
        ? "系列に基づく暫定説明"
        : "製品固有の機能説明（数値仕様は要データシート）",
      "javascript:alert(1)",
      "学習観点",
      "注意",
      "未個別検証",
    ]);
  }
  const strings = ["型番"];
  function sheet(rows: string[][]) {
    return `<${prefix}worksheet xmlns:x="urn:test"><${prefix}sheetData>${rows.map((row, index) => `<${prefix}row r="${index + 1}">${row.map((value, column) => `<${prefix}c r="${String.fromCharCode(65 + column)}${index + 1}" t="${shared && value === "型番" ? "s" : "inlineStr"}">${formula && index === 1 && column === 0 ? `<${prefix}f>1+1</${prefix}f>` : ""}${shared && value === "型番" ? `<${prefix}v>0</${prefix}v>` : `<${prefix}is><${prefix}t>${escapeXml(value)}</${prefix}t></${prefix}is>`}</${prefix}c>`).join("")}</${prefix}row>`).join("")}</${prefix}sheetData></${prefix}worksheet>`;
  }
  return {
    path: "fictional-reference.xlsx",
    bytes: zipSync({
      "xl/workbook.xml": strToU8(
        `<${prefix}workbook xmlns:x="urn:test" xmlns:r="urn:rel"><${prefix}sheets><${prefix}sheet name="IC Master" r:id="m"/><${prefix}sheet name="IC 詳細解説" r:id="d"/></${prefix}sheets></${prefix}workbook>`,
      ),
      "xl/_rels/workbook.xml.rels": strToU8(
        '<Relationships><Relationship Id="m" Target="/xl/worksheets/master.xml"/><Relationship Id="d" Target="worksheets/detail.xml"/></Relationships>',
      ),
      "xl/worksheets/master.xml": strToU8(sheet(masters)),
      "xl/worksheets/detail.xml": strToU8(sheet(details)),
      ...(shared
        ? {
            "xl/sharedStrings.xml": strToU8(
              `<sst>${strings.map((value) => `<si><t>${value}</t></si>`).join("")}</sst>`,
            ),
          }
        : {}),
    }),
  };
}

describe("IC workbook import and provenance", () => {
  it.each([
    { prefix: "x:", shared: true },
    { prefix: "", shared: false },
  ])("supports namespace and string variants %j", async (options) => {
    const library = await importIcWorkbook(workbook(options));
    expect(library.entries).toHaveLength(6);
    expect(library.source.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(library.entries[0].detailRow).toBe(2);
    expect(library.entries[5].adoptionExample).toBe("");
    expect(library.entries[5].rawDetail["採用先の例（元データ）"]).toBe(
      "採用先未特定",
    );
    expect(library.warnings).toHaveLength(1);
    expect(validateIcLibrary(JSON.parse(JSON.stringify(library)))).toEqual(
      library,
    );
  });
  it.each([
    { duplicate: true },
    { mismatch: true },
    { formula: true },
    { badHeader: true },
  ])("rejects conflicting or unsupported cells %j", async (options) => {
    await expect(importIcWorkbook(workbook(options))).rejects.toThrow();
  });
  it("rejects broken ZIP, excessive file size, and invalid backup fields", async () => {
    await expect(
      importIcWorkbook({ path: "bad.xlsx", bytes: strToU8("invalid") }),
    ).rejects.toThrow();
    await expect(
      importIcWorkbook({
        path: "big.xlsx",
        bytes: new Uint8Array(10 * 1024 * 1024 + 1),
      }),
    ).rejects.toThrow("10MB");
    const library = await importIcWorkbook(workbook());
    expect(() =>
      validateIcLibrary({
        ...library,
        entries: [...library.entries, library.entries[0]],
      }),
    ).toThrow();
    expect(() =>
      validateIcLibrary({
        ...library,
        entries: [{ ...library.entries[0], role: 12 }],
      }),
    ).toThrow();
    expect(() => validateIcLibrary(null)).toThrow();
  });
});

describe("IC learning and proposal safety", () => {
  it("rejects external entities, unsafe ZIP paths and external sheet relations", async () => {
    const files = unzipSync(workbook().bytes);
    await expect(
      importIcWorkbook({
        path: "unsafe.xlsx",
        bytes: zipSync({ ...files, "../escape.xml": strToU8("<x/>") }),
      }),
    ).rejects.toThrow("内部パス");
    await expect(
      importIcWorkbook({
        path: "entity.xlsx",
        bytes: zipSync({
          ...files,
          "xl/workbook.xml": strToU8(
            '<!DOCTYPE x [<!ENTITY y "unsafe">]><workbook/>',
          ),
        }),
      }),
    ).rejects.toThrow("外部実体");
    await expect(
      importIcWorkbook({
        path: "external.xlsx",
        bytes: zipSync({
          ...files,
          "xl/_rels/workbook.xml.rels": strToU8(
            '<Relationships><Relationship Id="m" Target="https://example.invalid/sheet.xml" TargetMode="External"/></Relationships>',
          ),
        }),
      }),
    ).rejects.toThrow("必要なシート");
  });

  it("prioritizes Industrial A/B without promoting provisional or C/D entries", async () => {
    const library = await importIcWorkbook(workbook());
    expect(library.entries.map(icPriority)).toEqual([1, 2, 2, 2, 2, 3]);
    expect(library.entries.map(icEligible)).toEqual([
      true,
      true,
      true,
      true,
      false,
      false,
    ]);
    expect(icEligible({ ...library.entries[0], usage: "candidate_only" })).toBe(
      false,
    );
    expect(icEligible({ ...library.entries[0], adoptionExample: "" })).toBe(
      false,
    );
    const questions = icShortQuestions(library);
    expect(questions).toHaveLength(8);
    for (const question of questions) {
      expect(
        new Set(question.selection.options.map((option) => option.text)).size,
      ).toBe(4);
      expect(question.sources[0].checkedAt).toBe("");
      expect(question.sources[0].url).toBe("");
      expect(question.detailed).toContain("採用理由: 不明");
      const answers = {
        selection: question.selection.correctId,
        reason: null,
        proposal:
          question.level === 3
            ? "未確認の条件を照合して候補を提案します。"
            : "",
      };
      const attempt = {
        id: question.id,
        question,
        answers,
        result: gradeShort(question, answers),
        hintsUsed: 0,
        selfAssessment: "unrated",
        createdAt: new Date().toISOString(),
      };
      expect(() => validateShortAttempts([attempt])).not.toThrow();
      expect(() =>
        validateLearningState({
          schemaVersion: 1,
          favorites: [],
          attempts: [],
          shortAttempts: [attempt],
        }),
      ).not.toThrow();
    }
    expect(questions[0].relatedProducts).toEqual(["TEST0"]);
    expect(
      learningProgress(questions, [], icCases(library), []).overall.total,
    ).toBe(12);
  });
  it("keeps adoption evidence, reason and capability verification separate in snapshots/prompts", async () => {
    const library = await importIcWorkbook(workbook());
    const question = icCases(library)[0];
    expect(question.record?.sourceUrls).toEqual([]);
    expect(caseEvidence(question.record!).adoptionReason.classification).toBe(
      "unknown",
    );
    expect(
      caseEvidence(question.record!).adoptionConfirmation.externallyVerified,
    ).toBe(false);
    const workflow = createWorkflow(question);
    workflow.products.ti = library.entries[0].partNumber;
    expect(assessWorkflow(workflow).status).not.toBe("confirmed");
    const answers = {
      ...emptyAnswers(),
      selection: icSelectionText(library.entries[0], library),
    };
    const attempt = {
      id: "ic-test-attempt",
      question,
      answers,
      evaluations: evaluate(question, answers),
      createdAt: new Date().toISOString(),
      selfRating: 2,
      followup: "",
      revealedStage: 0,
      learningLevel: 4 as const,
    };
    const state = {
      schemaVersion: 1 as const,
      favorites: [],
      attempts: [attempt],
    };
    expect(() =>
      validateLearningState(JSON.parse(JSON.stringify(state))),
    ).not.toThrow();
    const prompt = buildPrompt(attempt);
    expect(prompt).toContain(library.source.sha256);
    expect(prompt).toContain("原典根拠URL・引用・確認日: 未提供");
    expect(prompt).toContain("採用理由: 不明");
  });
});
