import { readFile, writeFile } from "node:fs/promises";
import { DOMParser } from "linkedom";
import { format, resolveConfig } from "prettier";
import type { Dataset, CaseRecord, Evidence } from "../src/model";
import { eligibleRecord } from "../src/importer";
import { bundledIcLibrary } from "../src/bundled-ic";

const [input, lab, output = "src/data/notion-training.json"] =
  process.argv.slice(2);
if (!input || !lab)
  throw new Error(
    "Usage: tsx scripts/compile-notion-training.ts notion.json TI_Product_Learning_Lab.html [output]",
  );
const original = JSON.parse(await readFile(input, "utf8")) as Dataset;
const document = new DOMParser().parseFromString(
  await readFile(lab, "utf8"),
  "text/html",
);
const deck = JSON.parse(document.querySelector("#deck")!.textContent) as {
  products: { n: string }[];
};
const known = new Set([
  ...deck.products.map((product) => product.n.toUpperCase()),
  ...bundledIcLibrary.entries.map((entry) => entry.partNumber.toUpperCase()),
]);
const evidence = (
  value: string,
  confidence: Evidence["confidence"] = "unknown",
): Evidence => ({
  value,
  confidence,
  basis: "Notion採用記載の匿名化教材。外部原典・採用理由・今回の成立は未確認。",
});
const extracted: CaseRecord[] = original.records
  .filter(eligibleRecord)
  .flatMap((record) => {
    const parts = [
      ...new Set(
        (
          record.fields.partNumbers.value
            .toUpperCase()
            .match(/[A-Z][A-Z0-9-]*\d[A-Z0-9-]*/g) ?? []
        ).filter((part) => known.has(part)),
      ),
    ];
    if (!parts.length) return [];
    return [
      {
        id: record.id,
        title: "匿名化したNotion採用記載",
        fields: {
          customer: evidence("匿名（非公開）"),
          application: evidence("搭載の記載あり（用途は匿名化）", "recorded"),
          industry: evidence(""),
          products: evidence(parts.join(" / "), "recorded"),
          partNumbers: evidence(parts.join(" / "), "recorded"),
          challenge: evidence(
            "顧客課題は未確認。採用記載だけから理由や仕様を断定しない。",
          ),
          adoptionReason: evidence(""),
          competitors: evidence(""),
          priority: evidence(""),
        },
        properties: {
          採用確認: "元Notion記載（外部原典未照合）。匿名化・型番のみ抽出。",
          原典確認日: "",
        },
        body: "個別顧客名・用途本文・推定理由・raw propertiesを非公開とした教材。仕様や採用理由は未確認。",
        sourceUrls: [],
        sources: record.sources.map((source) => ({
          format: source.format,
          path: "notion-export / 匿名化教材",
          sha256: source.sha256,
          locator: `record:${record.id}`,
        })),
        attachments: [],
      },
    ];
  });
const groups = new Map<string, CaseRecord[]>();
for (const record of extracted) {
  const key = record.fields.partNumbers.value.split(" / ").sort().join("|");
  groups.set(key, [...(groups.get(key) ?? []), record]);
}
const records = [...groups.values()].map((group) => ({
  ...group[0],
  sources: group.flatMap((record) => record.sources),
}));
const result: Dataset = {
  schemaVersion: 1,
  importedAt: original.importedAt,
  records,
  attachments: [],
  report: {
    files: {},
    csvTables: [],
    records: records.length,
    eligible: records.length,
    missing: {},
    confidence: {},
    duplicateGroups: [...groups.values()]
      .filter((group) => group.length > 1)
      .map((group) => group.map((record) => record.id)),
    warnings: [
      "匿名化・既知TI型番のみ。同梱教材は採用理由や動作条件を確定する根拠ではありません。端末内の既存データは優先保持します。",
      `${extracted.length}件の採用記載を、同じ型番構成の${records.length}教材へ統合しました。全出典を保持しています。`,
    ],
  },
};
await writeFile(
  output,
  await format(JSON.stringify(result), {
    ...(await resolveConfig(output)),
    parser: "json",
  }),
);
process.stdout.write(
  JSON.stringify({
    sourceRecords: original.records.length,
    publicTrainingRecords: records.length,
    output,
  }) + "\n",
);
