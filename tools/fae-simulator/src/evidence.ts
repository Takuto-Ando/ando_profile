import type { CaseRecord } from "./model";

export type CaseEvidence = {
  adoptionConfirmation: {
    value: string;
    classification: "fact" | "inference" | "unknown";
    externallyVerified: false;
  };
  adoptionReason: {
    value: string;
    classification: "inference" | "unknown";
    externallyVerified: false;
  };
  references: {
    url: string;
    excerpt: string;
    checkedAt: string | null;
    externallyVerified: false;
  }[];
};
export function caseEvidence(record: CaseRecord): CaseEvidence {
  const explicit =
    record.properties["採用確認"] ||
    record.properties["搭載確認"] ||
    record.properties["判定"] ||
    "";
  const products = record.fields.products.value;
  return {
    adoptionConfirmation: {
      value:
        explicit ||
        (products
          ? `Notion製品欄の記載: ${products}。搭載の独立確認は未実施。`
          : "搭載・採用の確認情報なし"),
      classification: explicit || products ? "fact" : "unknown",
      externallyVerified: false,
    },
    adoptionReason: {
      value: record.fields.adoptionReason.value || "採用理由は不明",
      classification: record.fields.adoptionReason.value
        ? "inference"
        : "unknown",
      externallyVerified: false,
    },
    references: record.sourceUrls.map((url) => ({
      url,
      excerpt:
        record.properties["根拠該当箇所"] ||
        record.properties["該当箇所"] ||
        "",
      checkedAt: record.properties["原典確認日"] || null,
      externallyVerified: false,
    })),
  };
}
