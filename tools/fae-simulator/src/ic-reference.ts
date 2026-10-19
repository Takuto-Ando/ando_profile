import { unzipSync } from "fflate";
import { DOMParser } from "linkedom";
import { sha256, type InputFile } from "./importer";
import type { CaseRecord, Category, Evidence, Question } from "./model";
import type { ShortQuestion, Theme } from "./short-model";
import { makeRubric } from "./questions";

export type IcReference = {
  partNumber: string;
  classification: string;
  role: string;
  interfaces: string;
  designChecks: string;
  adoptionExample: string;
  adoptionEvidence: string;
  sourceType: string;
  usage: string;
  explanationConfidence: string;
  productUrl: string;
  exercise: string;
  caution: string;
  specifications: string;
  masterCategory: string;
  masterRow: number;
  detailRow: number;
  rawMaster: Record<string, string>;
  rawDetail: Record<string, string>;
};
export type IcLibrary = {
  schemaVersion: 1;
  importedAt: string;
  source: { path: string; sha256: string };
  entries: IcReference[];
  warnings: string[];
};
type XmlElement = {
  tagName: string;
  textContent: string | null;
  getAttribute(name: string): string | null;
  querySelectorAll(selector: string): Iterable<XmlElement>;
};
function elements(root: Pick<XmlElement, "querySelectorAll">, name: string) {
  return [...root.querySelectorAll("*")].filter(
    (element) => element.tagName.split(":").at(-1) === name,
  );
}
const stringKeys = [
  "partNumber",
  "classification",
  "role",
  "interfaces",
  "designChecks",
  "adoptionExample",
  "adoptionEvidence",
  "sourceType",
  "usage",
  "explanationConfidence",
  "productUrl",
  "exercise",
  "caution",
  "specifications",
  "masterCategory",
] as const;
export function validateIcLibrary(input: unknown): IcLibrary {
  const library = input as IcLibrary;
  if (
    !library ||
    library.schemaVersion !== 1 ||
    !library.source ||
    typeof library.source.path !== "string" ||
    !/^[a-f0-9]{64}$/.test(library.source.sha256) ||
    typeof library.importedAt !== "string" ||
    !Number.isFinite(Date.parse(library.importedAt)) ||
    !Array.isArray(library.entries) ||
    library.entries.length > 1000 ||
    !Array.isArray(library.warnings) ||
    !library.warnings.every((value) => typeof value === "string")
  )
    throw new Error("IC資料JSONの形式が不正です");
  const parts = new Set<string>();
  for (const entry of library.entries) {
    if (
      !entry ||
      !stringKeys.every(
        (key) => typeof entry[key] === "string" && entry[key].length <= 20000,
      ) ||
      !entry.partNumber.trim() ||
      parts.has(entry.partNumber.toUpperCase()) ||
      !Number.isInteger(entry.masterRow) ||
      entry.masterRow < 2 ||
      !Number.isInteger(entry.detailRow) ||
      entry.detailRow < 2 ||
      ![entry.rawMaster, entry.rawDetail].every(
        (row) =>
          row &&
          typeof row === "object" &&
          !Array.isArray(row) &&
          Object.values(row).every(
            (cell) => typeof cell === "string" && cell.length <= 20000,
          ),
      )
    )
      throw new Error("IC資料の型番・行・重複を確認してください");
    parts.add(entry.partNumber.toUpperCase());
  }
  return library;
}

export async function importIcWorkbook(file: InputFile): Promise<IcLibrary> {
  if (file.bytes.length > 10 * 1024 * 1024)
    throw new Error("Excelは10MB以下にしてください");
  let expanded = 0;
  let count = 0;
  const archive = unzipSync(file.bytes, {
    filter: (entry) => {
      expanded += entry.originalSize;
      count += 1;
      if (expanded > 30 * 1024 * 1024 || count > 1000)
        throw new Error("Excel展開上限を超えています");
      if (entry.name.includes("..") || entry.name.startsWith("/"))
        throw new Error("Excel内部パスが不正です");
      return /\.xml$|\.rels$/.test(entry.name);
    },
  });
  function xml(path: string) {
    if (!archive[path])
      throw new Error(`Excel内部ファイルがありません: ${path}`);
    const text = new TextDecoder().decode(archive[path]);
    if (/<!DOCTYPE|<!ENTITY/i.test(text))
      throw new Error("外部実体を含むXMLは読み込めません");
    return new DOMParser().parseFromString(text, "text/xml");
  }
  const shared = archive["xl/sharedStrings.xml"]
    ? elements(xml("xl/sharedStrings.xml"), "si").map(
        (item) => item.textContent ?? "",
      )
    : [];
  const relations = new Map(
    elements(xml("xl/_rels/workbook.xml.rels"), "Relationship")
      .filter((item) => item.getAttribute("TargetMode") !== "External")
      .map((item) => [
        item.getAttribute("Id"),
        item.getAttribute("Target") ?? "",
      ]),
  );
  const sheets = new Map(
    elements(xml("xl/workbook.xml"), "sheet").map((item) => [
      item.getAttribute("name"),
      relations.get(item.getAttribute("r:id")),
    ]),
  );
  function table(name: string) {
    const target = sheets.get(name);
    if (!target || target.includes("..") || target.includes("://"))
      throw new Error(`必要なシートがありません: ${name}`);
    const path = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
    const rows = elements(xml(path), "row");
    if (rows.length > 1001) throw new Error("IC資料は1000行以下にしてください");
    const values = rows.map((row) => {
      const cells: string[] = [];
      for (const cell of elements(row, "c")) {
        if (elements(cell, "f").length)
          throw new Error("数式セルは値に変換して取り込んでください");
        const column = (cell.getAttribute("r") ?? "").match(/^[A-Z]+/)?.[0];
        if (!column || column.length > 3) throw new Error("セル位置が不正です");
        let index = 0;
        for (const character of column)
          index = index * 26 + character.charCodeAt(0) - 64;
        if (index > 64) throw new Error("IC資料の列数上限を超えています");
        const value = elements(cell, "v")[0]?.textContent ?? "";
        cells[index - 1] = (
          cell.getAttribute("t") === "s"
            ? (shared[Number(value)] ?? "")
            : cell.getAttribute("t") === "inlineStr"
              ? (elements(cell, "is")[0]?.textContent ?? "")
              : value
        ).trim();
      }
      return { row: Number(row.getAttribute("r")), cells };
    });
    const headers = values.shift()?.cells ?? [];
    if (headers[0] !== "型番")
      throw new Error(`${name}の型番列を確認してください`);
    const required =
      name === "IC Master"
        ? [
            "分類",
            "採用先の例",
            "証拠レベル",
            "情報源の種類",
            "シミュレータ利用",
            "注意事項",
          ]
        : [
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
    if (
      new Set(headers).size !== headers.length ||
      !required.every((header) => headers.includes(header))
    )
      throw new Error(`${name}の必要な列が不足または重複しています`);
    return values
      .filter((item) => item.cells.some(Boolean))
      .map((item) => ({
        row: item.row,
        data: Object.fromEntries(
          headers.map((header, index) => [header, item.cells[index] ?? ""]),
        ),
      }));
  }
  const masters = table("IC Master");
  const details = table("IC 詳細解説");
  const entries: IcReference[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  for (const detail of details) {
    const data = detail.data;
    const part = data["型番"].toUpperCase();
    if (!part || seen.has(part))
      throw new Error("詳細シートに空の型番または重複型番があります");
    seen.add(part);
    const matches = masters.filter(
      (master) => master.data["型番"].toUpperCase() === part,
    );
    if (matches.length !== 1)
      throw new Error(`${part}: IC Masterとの一意な対応を確認してください`);
    const master = matches[0];
    if (data["採用証拠レベル（元データ）"] !== master.data["証拠レベル"])
      throw new Error(`${part}: シート間で証拠レベルが矛盾しています`);
    if (
      master.data["採用先の例"] &&
      master.data["採用先の例"] !== data["採用先の例（元データ）"]
    )
      throw new Error(`${part}: シート間で採用例が矛盾しています`);
    if (!master.data["採用先の例"])
      warnings.push(`${part}: IC Masterの採用先は空欄（不明）`);
    entries.push({
      partNumber: part,
      classification: data["正式な分類・製品種別"] ?? "",
      role: data["役割・何をするか"] ?? "",
      interfaces: data["信号・接続インターフェース"] ?? "",
      designChecks: data["回路設計で確認するポイント"] ?? "",
      adoptionExample: master.data["採用先の例"] ?? "",
      adoptionEvidence: master.data["証拠レベル"] ?? "",
      sourceType: master.data["情報源の種類"] ?? "",
      usage: data["シミュレータ扱い"] ?? "",
      explanationConfidence: data["説明の確度"] ?? "",
      productUrl: data["TI製品ページ候補URL"] ?? "",
      exercise: data["FAE練習問題の観点"] ?? "",
      caution: data["検証上の注意"] ?? "",
      specifications: data["主要仕様（確認済のみ）"] ?? "",
      masterCategory: master.data["分類"] ?? "",
      masterRow: master.row,
      detailRow: detail.row,
      rawMaster: master.data,
      rawDetail: data,
    });
  }
  if (masters.length !== entries.length)
    throw new Error("2シートの型番件数が一致しません");
  return validateIcLibrary({
    schemaVersion: 1,
    importedAt: new Date().toISOString(),
    source: { path: file.path, sha256: await sha256(file.bytes) },
    entries,
    warnings,
  });
}

export function icPriority(entry: IcReference): 1 | 2 | 3 {
  if (!/^[AB]_/.test(entry.adoptionEvidence)) return 3;
  return /産業|Sitara|Hercules|C2000|Sub-1GHz|Robotics|Remote I\/O/i.test(
    `${entry.classification} ${entry.adoptionExample}`,
  )
    ? 1
    : 2;
}
export function icEligible(entry: IcReference): boolean {
  return (
    /^[AB]_/.test(entry.adoptionEvidence) &&
    entry.usage === "verified_case" &&
    !!entry.adoptionExample &&
    !!entry.role &&
    [
      "個別確認または既知製品情報",
      "製品固有の機能説明（数値仕様は要データシート）",
    ].includes(entry.explanationConfidence)
  );
}
function domain(entry: IcReference): { category: Category; theme: Theme } {
  const text = `${entry.classification} ${entry.role}`;
  if (/電源|Buck|充電|eFuse|ロードスイッチ|パワー|電力段|GaN/i.test(text))
    return { category: "電源", theme: "power" };
  if (/無線|GHz/.test(text))
    return { category: "無線", theme: "communication" };
  if (/Ethernet|PHY|USB|通信/.test(text))
    return { category: "産業通信", theme: "communication" };
  if (/絶縁|保護/.test(text)) return { category: "保護", theme: "protection" };
  if (/C2000|モータ制御/.test(entry.classification))
    return { category: "リアルタイム制御", theme: "series" };
  if (
    /MPU|プロセッサ/.test(entry.classification) &&
    !/MCU/.test(entry.classification)
  )
    return { category: "Processor", theme: "series" };
  if (/MCU|DSP|プロセッサ/.test(text))
    return { category: "MCU", theme: "series" };
  return { category: "アナログ", theme: "sensing" };
}
export function icSelectionText(
  entry: IcReference,
  library: IcLibrary,
): string {
  return `候補TI型番: ${entry.partNumber}\n資料記載の役割: ${entry.role || "不明"}\n採用例（元資料の記載・独立未検証）: ${entry.adoptionExample || "不明"}\n採用証拠ラベル（元資料）: ${entry.adoptionEvidence}\n機能説明の確度（元資料）: ${entry.explanationConfidence}\n採用理由: 不明。今回の要件への適合: 未検証。\n設計で確認する項目: ${entry.designChecks || "データシートと顧客条件の照合"}\n製品ページ候補（存在・内容未照合）: ${entry.productUrl || "不明"}\n出典: ${library.source.path} / IC Master行${entry.masterRow} / IC 詳細解説行${entry.detailRow} / SHA256 ${library.source.sha256}\n原典根拠URL・引用・確認日: 未提供。採用実績だけで今回の成立性を保証しない。`;
}
export function icCases(library: IcLibrary | null): Question[] {
  if (!library) return [];
  return library.entries
    .filter(icEligible)
    .sort((first, second) => icPriority(first) - icPriority(second))
    .map((entry) => {
      const evidence = (value: string): Evidence => ({
        value,
        confidence: value ? "recorded" : "unknown",
        basis: "Excelの記載・独立未検証",
      });
      const record: CaseRecord = {
        id: `ic-record-${entry.partNumber}`,
        title: `${entry.partNumber} / ${entry.adoptionExample}`,
        fields: {
          customer: evidence(""),
          application: evidence(entry.adoptionExample),
          industry: evidence(""),
          products: evidence(entry.partNumber),
          partNumbers: evidence(entry.partNumber),
          challenge: evidence(""),
          adoptionReason: evidence(""),
          competitors: evidence(""),
          priority: evidence(`P${icPriority(entry)}`),
        },
        properties: {
          採用確認: `Excel記載: ${entry.adoptionEvidence}。外部原典の確認は未実施。`,
          原典確認日: "",
        },
        body: icSelectionText(entry, library),
        sourceUrls: [],
        attachments: [],
        sources: [
          {
            path: library.source.path,
            sha256: library.source.sha256,
            format: "xlsx",
            locator: `IC Master!行${entry.masterRow}; IC 詳細解説!行${entry.detailRow}`,
          },
        ],
      };
      return {
        id: `ic-case-${entry.partNumber}`,
        mode: "reverse",
        title: `Excel採用記載から提案: ${entry.partNumber}`,
        category: [domain(entry).category],
        difficulty: 2,
        brief: `元資料に「${entry.adoptionExample}」での採用例が記載されています。実際の顧客要求・採用理由は不明です。採用を再現する正解ではなく、確認質問と候補提案を練習します。`,
        stages: [icSelectionText(entry, library)],
        rubric: makeRubric(
          [entry.partNumber],
          `資料記載の役割: ${entry.role}。採用理由は不明であり仮説として扱う。`,
        ),
        reference: `${icSelectionText(entry, library)}\n参考提案: ${entry.partNumber}を検討候補とし、${entry.designChecks}を顧客に確認。データシート・現行品・移行コストを同条件で照合し、適合が不明なら選定を保留する。`,
        urls: [],
        record,
      };
    });
}
export function icShortQuestions(library: IcLibrary | null): ShortQuestion[] {
  if (!library) return [];
  return library.entries
    .filter(icEligible)
    .sort((first, second) => icPriority(first) - icPriority(second))
    .flatMap((entry, index) => {
      const alternatives = [
        ...new Set(library.entries.filter(icEligible).map((item) => item.role)),
      ]
        .filter((role) => role !== entry.role)
        .slice(0, 3);
      if (alternatives.length !== 3) return [];
      const roles = [entry.role, ...alternatives];
      const options = roles.map((text, optionIndex) => ({
        id: `ic-option-${optionIndex}`,
        text,
        explanation:
          optionIndex === 0
            ? `Excelでの記載です。${entry.explanationConfidence}。`
            : "この型番のExcel記載とは異なります。実際の仕様は原典で確認します。",
      }));
      const offset = index % 4;
      return ([1, 3] as const).map((level) => ({
        id: `ic-short-${entry.partNumber}-lv${level}`,
        conceptId: `ic-${entry.partNumber}`,
        level,
        theme: domain(entry).theme,
        category: [domain(entry).category],
        title: `資料読解: ${entry.partNumber}の役割`,
        selection: {
          prompt: `このExcelでは、${entry.partNumber}の役割はどれと記載されていますか？（採用理由や仕様適合を問う問題ではありません）`,
          options: [...options.slice(offset), ...options.slice(0, offset)],
          correctId: "ic-option-0",
        },
        hints: [
          `役割と採用理由を区別します。分類: ${entry.classification}`,
          `資料記載のインターフェース: ${entry.interfaces || "不明"}`,
          ["ic-option-0", "ic-option-1"],
        ],
        basic: `資料記載: ${entry.role}。採用例: ${entry.adoptionExample}（独立未検証）。採用理由は不明です。`,
        detailed: icSelectionText(entry, library),
        relatedProducts: [entry.partNumber],
        sources: [
          {
            url: "",
            section: `IC 詳細解説 行${entry.detailRow} / 役割・何をするか。外部原典は未確認。`,
            checkedAt: "",
            scope: "reference",
            localPath: `${library.source.path} / SHA256 ${library.source.sha256}`,
          },
        ],
        advancedIds: [`ic-case-${entry.partNumber}`],
      }));
    });
}
