import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { importFiles, parseCsv, safeUrl } from "../src/importer";
import { reverseQuestions } from "../src/questions";

const file = (path: string, content: string) => ({
  path,
  bytes: strToU8(content),
});
const html = (
  title = "Drive",
  reason = "低コストとの仮説",
  challenge = "周期制御",
) =>
  `<html><body><article id="12345678-abcd-1234-abcd-123456789000"><h1 class="page-title">${title}</h1><table class="properties"><tr><th>会社名</th><td>Sample</td></tr><tr><th>業界</th><td>Industrial</td></tr><tr><th>TI製品</th><td>MCU</td></tr><tr><th>課題</th><td>${challenge}</td></tr><tr><th>採用理由</th><td>${reason}</td></tr></table><div class="page-body"><p>TPS65150-Q1 のような候補</p><p>Renesasも候補</p><a href="https://example.com/source">資料</a><img src="photo.png"/></div></article></body></html>`;
describe("Notion normalization", () => {
  it("treats an untitled page as a missing application", async () => {
    const dataset = await importFiles([
      file("unknown.md", "# 無題\n会社名: Sample\n課題: 精度"),
    ]);
    expect(dataset.records[0].fields.application).toMatchObject({
      value: "",
      confidence: "unknown",
    });
    expect(dataset.report.eligible).toBe(0);
  });
  it("parses BOM, quoted multiline, commas, escaped quotes and CRLF", () => {
    expect(parseCsv('\uFEFFName,説明\r\nA,"one, two\n""quoted"""\r\n')).toEqual(
      [{ Name: "A", 説明: 'one, two\n"quoted"' }],
    );
  });
  it("rejects malformed CSV without partial import", () => {
    expect(() => parseCsv('a,b\n"open')).toThrow();
    expect(() => parseCsv("a,b\n1,2,3")).toThrow();
    expect(() => parseCsv("a,a\n1,2")).toThrow();
  });
  it("extracts HTML properties, body, attachments and provenance", async () => {
    const dataset = await importFiles([
      file("Drive.html", html()),
      file("photo.png", "image"),
    ]);
    const record = dataset.records[0];
    expect(record.fields.customer.value).toBe("Sample");
    expect(record.body).toContain("TPS65150-Q1");
    expect(record.fields.partNumbers.value).toBe("");
    expect(record.fields.adoptionReason.confidence).toBe("inferred");
    expect(record.fields.competitors).toMatchObject({
      value: "Renesas",
      confidence: "inferred",
    });
    expect(record.sourceUrls).toEqual(["https://example.com/source"]);
    expect(record.attachments).toEqual(["photo.png"]);
    expect(record.sources[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(dataset.attachments[0].bytes).toBe(5);
    expect(dataset.report.eligible).toBe(1);
  });
  it("does not promote source certainty labels to externally verified reasons", async () => {
    const dataset = await importFiles([
      file(
        "cases.csv",
        "事業名,会社名,TI製品,課題,分析確度,採用理由\nA,C,TPS62180,電源,公式根拠あり,小型化",
      ),
    ]);
    expect(dataset.records[0].fields.adoptionReason.confidence).toBe(
      "inferred",
    );
    expect(dataset.records[0].properties["分析確度"]).toBe("公式根拠あり");
    expect(dataset.records[0].fields.partNumbers.value).toBe("TPS62180");
  });
  it("keeps unknown fields empty and preserves the original label", async () => {
    const dataset = await importFiles([
      file("case.md", "# Sample\n会社名: 不明\nTI製品: 非公開\n課題: 未確認\n"),
    ]);
    expect(dataset.records[0].fields.customer).toMatchObject({
      value: "",
      confidence: "unknown",
    });
    expect(dataset.records[0].properties["会社名"]).toBe("不明");
    expect(dataset.report.eligible).toBe(0);
  });
  it("merges CSV rows with corresponding HTML and retains both sources", async () => {
    const dataset = await importFiles([
      file("Drive.html", html()),
      file("cases.csv", "事業名,会社名,TI製品,課題\nDrive,Sample,MCU,周期制御"),
    ]);
    expect(dataset.records).toHaveLength(1);
    expect(dataset.records[0].sources).toHaveLength(2);
    expect(dataset.records[0].sources[1].locator).toBe("row 2");
  });
  it("pairs repeated names by full properties rather than creating CSV copies", async () => {
    const dataset = await importFiles([
      file("a.html", html("Drive", "", "制御")),
      file("b.html", html("Drive", "", "電源")),
      file(
        "cases.csv",
        "事業名,会社名,TI製品,課題\nDrive,Sample,MCU,電源\nDrive,Sample,MCU,制御",
      ),
    ]);
    expect(dataset.records).toHaveLength(2);
    expect(dataset.records.every((record) => record.sources.length === 2)).toBe(
      true,
    );
    expect(dataset.report.duplicateGroups).toHaveLength(1);
    expect(new Set(dataset.records.map((record) => record.id)).size).toBe(2);
  });
  it("preserves conflicts with a warning", async () => {
    const dataset = await importFiles([
      file("Drive.html", html()),
      file("cases.csv", "事業名,会社名,TI製品,課題\nDrive,Sample,MCU,別の課題"),
    ]);
    expect(dataset.report.warnings.join(" ")).toContain("不一致");
    expect(dataset.records[0].fields.challenge.value).toBe("周期制御");
  });
  it("reads ZIP and ignores Windows download metadata", async () => {
    const zip = zipSync({
      "export/case.md": strToU8(
        "# Drive\n会社名: Sample\nTI製品: MSPM0G3507\n課題: 精度",
      ),
      "export/image.png": strToU8("image"),
      "export/case.md:Zone.Identifier": strToU8("metadata"),
    });
    const dataset = await importFiles([{ path: "export.zip", bytes: zip }]);
    expect(dataset.records).toHaveLength(1);
    expect(dataset.attachments).toHaveLength(1);
    expect(dataset.records[0].sources[0].path).toBe(
      "export.zip/export/case.md",
    );
  });
  it("rejects unsafe ZIP paths", async () => {
    await expect(
      importFiles([
        {
          path: "test.zip",
          bytes: zipSync({ "../evil.md": strToU8("# bad") }),
        },
      ]),
    ).rejects.toThrow("安全");
  });
  it("detects duplicate cases and excludes repeated entries from questions", async () => {
    const dataset = await importFiles([
      file(
        "cases.csv",
        "事業名,会社名,TI製品,課題\nA,C,MSPM0G3507,精度\nA,C,MSPM0G3507,精度",
      ),
    ]);
    expect(dataset.records).toHaveLength(2);
    expect(dataset.report.duplicateGroups).toHaveLength(1);
    expect(reverseQuestions(dataset)).toHaveLength(1);
  });
  it("does not expose customer, title or part number in the initial reverse exercise", async () => {
    const dataset = await importFiles([
      file(
        "cases.csv",
        "事業名,会社名,TI製品,課題\nSecretProduct,SecretCo,TPS62180,電源",
      ),
    ]);
    const question = reverseQuestions(dataset)[0];
    expect(question.title + question.brief).not.toContain("Secret");
    expect(question.title + question.brief).not.toContain("TPS62180");
    expect(question.stages[0]).toContain("SecretCo");
    expect(question.stages[2]).toContain("TPS62180");
  });
  it("blocks non-HTTP executable links", () => {
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeUrl("data:text/html,test")).toBeUndefined();
    expect(safeUrl("https://example.com/")).toBe("https://example.com/");
  });
});
