import { unzipSync } from "fflate";
import { parseHTML } from "linkedom";
import type {
  CaseRecord,
  Confidence,
  Dataset,
  Evidence,
  FieldName,
  Source,
} from "./model";

export type InputFile = { path: string; bytes: Uint8Array };
const decoder = new TextDecoder("utf-8");
const maxBytes = 100 * 1024 * 1024;
const aliases: Record<FieldName, string[]> = {
  customer: ["会社名", "顧客名", "顧客", "Customer"],
  application: ["事業名", "機種", "搭載製品", "Name", "名前", "タイトル"],
  industry: ["業界", "業種", "Industry"],
  products: ["TI製品", "TI製IC・機能", "採用TI製品", "TI製品型番"],
  partNumbers: ["TI製品型番", "型番"],
  challenge: ["課題", "顧客課題", "クリティカル課題とTI解決策"],
  adoptionReason: ["TI選定の決め手・競合比較", "採用理由", "選定理由"],
  competitors: ["競合", "競合製品", "Competitor"],
  priority: ["補正後学習優先度", "学習優先度", "優先度"],
};
const uncertain =
  /推定|仮説|想定|と考え|とされ|のよう|候補|技術的観点|観点から|可能性/;
const unknown =
  /^(?:不明|未確認|未整理|非公開|なし|無題|untitled|unknown|n\/a|-)$/i;
const models =
  /\b(?:TPS|TPD|TMS|MSP|AM|CC|ISO|INA|OPA|ADS|DAC|DRV|LM|SN|UCC|BQ|PCM|TLV|TM4C|DP|DS|OMAP|AFE|TMP)[A-Z]*\d[A-Z0-9]*(?:-[A-Z0-9]+)?\b/g;
const clean = (value: string) => value.replace(/\s+/g, " ").trim();
export const safeUrl = (value: string): string | undefined => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};
const urlsIn = (value: string) => [
  ...new Set(
    (value.match(/https?:\/\/[^\s<>"'）)\]]+/g) ?? [])
      .map(safeUrl)
      .filter((url): url is string => !!url),
  ),
];
export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes));
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}
export function parseCsv(input: string): Record<string, string>[] {
  const table: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const text = input.replace(/^\uFEFF/, "");
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (quoted || !cell) quoted = !quoted;
      else throw new Error("CSVの引用符が不正です");
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) table.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("CSVの引用符が閉じていません");
  row.push(cell);
  if (row.some((value) => value.trim())) table.push(row);
  const headers = table.shift() ?? [];
  if (new Set(headers).size !== headers.length)
    throw new Error("CSVに重複列があります");
  return table.map((values, index) => {
    if (values.length !== headers.length)
      throw new Error(`CSV ${index + 2}行目の列数が不一致です`);
    return Object.fromEntries(
      headers.map((header, column) => [header.trim(), values[column].trim()]),
    );
  });
}
function parsedPage(path: string, input: string) {
  const properties: Record<string, string> = {};
  let title = "";
  let body = "";
  let links: string[] = [];
  let attachments: string[] = [];
  if (/\.html?$/i.test(path)) {
    const { document } = parseHTML(input);
    title = clean(
      document.querySelector(".page-title, h1, title")?.textContent ?? "",
    );
    for (const row of document.querySelectorAll("table.properties tr")) {
      const key = clean(row.querySelector("th")?.textContent ?? "");
      if (key)
        properties[key] = clean(row.querySelector("td")?.textContent ?? "");
    }
    const content =
      document.querySelector(".page-body") ?? document.querySelector("article");
    body = Array.from(content?.children ?? [])
      .map((element) => clean(element.textContent ?? ""))
      .filter(Boolean)
      .join("\n");
    links = Array.from(document.querySelectorAll("a[href]")).map(
      (anchor) => anchor.getAttribute("href") ?? "",
    );
    attachments = Array.from(document.querySelectorAll("a[href], img[src]"))
      .map(
        (element) =>
          element.getAttribute("href") ?? element.getAttribute("src") ?? "",
      )
      .filter(
        (value) => value && !/^(?:https?:|data:|#|javascript:)/i.test(value),
      );
    return {
      title,
      properties,
      body,
      links,
      attachments,
      pageId: document.querySelector("article")?.id.replaceAll("-", ""),
    };
  }
  title =
    input.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    path
      .split("/")
      .at(-1)
      ?.replace(/\s+[a-f0-9]{32}\.md$/i, "")
      .replace(/\.md$/i, "") ??
    "";
  for (const line of input.split("\n")) {
    const property = line.match(/^([^#\n:*]{1,60}):\s*(.*)$/);
    if (property) properties[property[1].trim()] = property[2].trim();
  }
  body = input;
  links = urlsIn(input);
  attachments = [...input.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|#)/i.test(value));
  return {
    title,
    properties,
    body,
    links,
    attachments,
    pageId: path.match(/([a-f0-9]{32})\.(?:md|html?)$/i)?.[1],
  };
}
function normalize(
  properties: Record<string, string>,
  title: string,
  body: string,
  source: Source,
  links: string[] = [],
  attachments: string[] = [],
  pageId?: string,
): CaseRecord {
  const fields = {} as Record<FieldName, Evidence>;
  for (const [field, names] of Object.entries(aliases) as [
    FieldName,
    string[],
  ][]) {
    const key = names.find((name) => properties[name]?.trim());
    const raw = key ? properties[key] : field === "application" ? title : "";
    const value = unknown.test(raw) ? "" : raw;
    let confidence: Confidence = !value
      ? "unknown"
      : uncertain.test(value)
        ? "inferred"
        : "recorded";
    if (["challenge", "adoptionReason", "competitors"].includes(field) && value)
      confidence = "inferred";
    fields[field] = {
      value,
      confidence,
      basis: key
        ? `プロパティ「${key}」`
        : value
          ? "ページ見出し"
          : "記載なし／不明",
    };
  }
  if (!fields.partNumbers.value) {
    const found = [...new Set(fields.products.value.match(models) ?? [])];
    fields.partNumbers = {
      value: found.join(" / "),
      confidence: !found.length
        ? "unknown"
        : uncertain.test(fields.products.value) ||
            /未確認|非公開/.test(fields.products.value)
          ? "inferred"
          : "recorded",
      basis: "TI製品プロパティから抽出（本文中の例示型番は不採用）",
    };
  }
  if (!fields.competitors.value) {
    const found = [
      ...new Set(
        (body + " " + fields.adoptionReason.value).match(
          /\b(?:STM32\w*|Renesas|ADI|NXP|Infineon|Richtek|STMicroelectronics|Analog Devices)\b/gi,
        ) ?? [],
      ),
    ];
    fields.competitors = {
      value: found.join(" / "),
      confidence: found.length ? "inferred" : "unknown",
      basis: "本文中の他社名言及。実際の競合・採用は未確認",
    };
  }
  return {
    id:
      pageId ||
      source.sha256.slice(0, 24) + "-" + source.locator.replace(/\W/g, ""),
    title: title || fields.application.value || "無題",
    fields,
    properties,
    body,
    sourceUrls: [
      ...new Set([
        ...links.map(safeUrl).filter((value): value is string => !!value),
        ...urlsIn(
          Object.entries(properties)
            .filter(([key]) => /出典|根拠|URL|リンク/.test(key))
            .map(([, value]) => value)
            .join(" "),
        ),
      ]),
    ],
    sources: [source],
    attachments,
  };
}
export async function importFiles(inputs: InputFile[]): Promise<Dataset> {
  const expanded: InputFile[] = [];
  let total = 0;
  const add = (file: InputFile) => {
    if (/(?:^|\/)\.\.(?:\/|$)|^\/|^[A-Za-z]:|\\/.test(file.path))
      throw new Error("安全でないファイルパスです");
    total += file.bytes.length;
    if (total > maxBytes || expanded.length >= 5000)
      throw new Error("取り込み上限（100MB・5000ファイル）を超えています");
    expanded.push(file);
  };
  for (const input of inputs) {
    if (input.bytes.length > maxBytes)
      throw new Error("入力が100MBを超えています");
    if (/\.zip$/i.test(input.path)) {
      let declared = 0;
      let entries = 0;
      const archive = unzipSync(input.bytes, {
        filter: (entry) => {
          declared += entry.originalSize;
          entries += 1;
          if (declared > maxBytes || entries > 5000)
            throw new Error("ZIP展開上限を超えています");
          return !entry.name.endsWith("/");
        },
      });
      for (const [path, bytes] of Object.entries(archive))
        add({ path: input.path + "/" + path, bytes });
    } else add(input);
  }
  const report: Dataset["report"] = {
    files: {},
    csvTables: [],
    records: 0,
    eligible: 0,
    missing: {},
    confidence: {},
    duplicateGroups: [],
    warnings: [],
  };
  const records: CaseRecord[] = [];
  const attachments: Dataset["attachments"] = [];
  const csvFiles: InputFile[] = [];
  for (const file of expanded) {
    if (
      file.path.endsWith(":Zone.Identifier") ||
      /(?:^|\/)\.(?:DS_Store|_)/.test(file.path)
    )
      continue;
    const format = file.path.split(".").at(-1)?.toLowerCase() ?? "unknown";
    report.files[format] = (report.files[format] ?? 0) + 1;
    if (format === "csv") {
      csvFiles.push(file);
      continue;
    }
    const hash = await sha256(file.bytes);
    if (["html", "htm", "md", "markdown"].includes(format)) {
      const page = parsedPage(file.path, decoder.decode(file.bytes));
      if (Object.keys(page.properties).length === 0) {
        report.warnings.push(`DBプロパティなし（問題化対象外）: ${file.path}`);
        continue;
      }
      const source = { path: file.path, sha256: hash, format, locator: "page" };
      records.push(
        normalize(
          page.properties,
          page.title,
          page.body,
          source,
          page.links,
          page.attachments,
          page.pageId,
        ),
      );
    } else
      attachments.push({
        path: file.path,
        bytes: file.bytes.length,
        sha256: hash,
      });
  }
  for (const file of csvFiles) {
    const rows = parseCsv(decoder.decode(file.bytes));
    const hash = await sha256(file.bytes);
    const columns = Object.keys(rows[0] ?? {});
    report.csvTables.push({
      path: file.path,
      rows: rows.length,
      columns,
      missing: Object.fromEntries(
        columns.map((key) => [key, rows.filter((row) => !row[key]).length]),
      ),
    });
    for (const [index, row] of rows.entries()) {
      const source = {
        path: file.path,
        sha256: hash,
        format: "csv",
        locator: `row ${index + 2}`,
      };
      const title =
        aliases.application.map((key) => row[key]).find(Boolean) ?? "";
      const candidate = normalize(row, title, "", source);
      const matches = records.filter(
        (record) =>
          clean(record.title).toLowerCase() === clean(title).toLowerCase() &&
          record.fields.customer.value === candidate.fields.customer.value,
      );
      const exact = (title ? matches : records).filter(
        (record) =>
          !record.sources.some((item) => item.path === file.path) &&
          Object.entries(row).every(
            ([key, value]) =>
              !value ||
              (aliases.application.includes(key)
                ? clean(record.title) === clean(value)
                : clean(record.properties[key] ?? "") === clean(value)),
          ),
      );
      const existing =
        exact[0] ??
        (matches.length === 1 &&
        title &&
        !matches[0].sources.some((item) => item.path === file.path)
          ? matches[0]
          : undefined);
      if (existing) {
        existing.sources.push(source);
        for (const key of Object.keys(aliases) as FieldName[])
          if (!existing.fields[key].value && candidate.fields[key].value)
            existing.fields[key] = candidate.fields[key];
        existing.sourceUrls = [
          ...new Set([...existing.sourceUrls, ...candidate.sourceUrls]),
        ];
        for (const [key, value] of Object.entries(row)) {
          if (
            existing.properties[key] &&
            value &&
            existing.properties[key] !== value
          )
            report.warnings.push(
              `CSV/本文プロパティ不一致: ${existing.title} / ${key}。HTML/MD優先、CSV原本出典を保持`,
            );
          else if (value) existing.properties[key] = value;
        }
      } else records.push(candidate);
    }
  }
  const byIdentity = new Map<string, CaseRecord[]>();
  const ids = new Set<string>();
  for (const record of records) {
    const originalId = record.id;
    let suffix = 1;
    while (ids.has(record.id)) {
      record.id = `${originalId}-${suffix}`;
      suffix += 1;
    }
    ids.add(record.id);
    const fingerprint = [
      record.fields.customer.value,
      record.fields.application.value,
      record.fields.products.value,
    ]
      .map((value) => value.toLowerCase().replace(/[\s\/・]/g, ""))
      .join("|");
    if (record.fields.application.value)
      byIdentity.set(fingerprint, [
        ...(byIdentity.get(fingerprint) ?? []),
        record,
      ]);
  }
  for (const group of byIdentity.values())
    if (group.length > 1) {
      const quality = (record: CaseRecord) =>
        (record.fields.adoptionReason.value ? 4 : 0) +
        (record.sourceUrls.length ? 2 : 0) +
        (!/製品内部の電源・信号・処理/.test(record.fields.challenge.value)
          ? 1
          : 0);
      group.sort(
        (first, second) =>
          quality(second) - quality(first) || first.id.localeCompare(second.id),
      );
      report.duplicateGroups.push(group.map((record) => record.id));
      group.slice(1).forEach((record) => {
        record.duplicateOf = group[0].id;
      });
    }
  for (const field of Object.keys(aliases) as FieldName[])
    report.missing[field] = records.filter(
      (record) => !record.fields[field].value,
    ).length;
  for (const record of records)
    for (const evidence of Object.values(record.fields))
      report.confidence[evidence.confidence] =
        (report.confidence[evidence.confidence] ?? 0) + 1;
  report.records = records.length;
  report.eligible = records.filter(eligibleRecord).length;
  if (!records.length)
    throw new Error("DBプロパティを持つCSV/HTML/Markdownが見つかりません");
  report.warnings.push(
    "recordedはエクスポートへの記載確認のみ。URLの内容・採用理由の外部照合は未実施。添付はSHA・サイズ・参照のみ、OCR/内容解析は未実施。",
  );
  return {
    schemaVersion: 1,
    importedAt: new Date().toISOString(),
    records,
    attachments,
    report,
  };
}
export function eligibleRecord(record: CaseRecord) {
  return (
    !record.duplicateOf &&
    !!record.fields.application.value &&
    !!record.fields.customer.value &&
    !!record.fields.challenge.value
  );
}
