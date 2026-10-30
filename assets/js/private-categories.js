const quizTitles = new Set([
  "TI クイズ一覧",
  "TI 用途・特徴クイズ",
  "TI デジタルセミナークイズ",
  "TI ブロック図・回路クイズ",
  "TI アナログセミナークイズ",
  "TI セミナークイズ",
]);

export const materialCategories = [
  {
    title: "TI製品・技術の全体像",
    description: "製品分類や学習順序を把握する",
    matches:
      /Product Learning Lab|Product Taxonomy|分類|ロードマップ|教材一覧/i,
  },
  {
    title: "MCU・Processor・デジタル",
    description: "処理構成・制御・通信を調べる",
    matches: /MCU|Processor|デジタル|Digital|Sitara|C2000/i,
  },
  {
    title: "アナログ・電源",
    description: "信号処理と電源設計を深める",
    matches: /アナログ|電源|Analog|PSDS/i,
  },
  {
    title: "システム・ブロック図",
    description: "装置全体と機能ブロックを理解する",
    matches: /ブロック|システム|装置|産業FAE|Industrial/i,
  },
  {
    title: "セミナー・学習ノート",
    description: "講義資料や学習ノートを振り返る",
    matches: /セミナー|ノート|Seminar/i,
  },
  {
    title: "業界・競合・キャリア",
    description: "市場・競合・FAEの役割を知る",
    matches: /業界|競合|キャリア|市場|組織|研究|FAE/i,
  },
];

export function groupMaterials(entries) {
  const groups = materialCategories.map((category) => ({
    ...category,
    entries: [],
  }));
  for (const entry of entries) {
    if (quizTitles.has(entry.title.trim().replace(/\s+/g, " "))) continue;
    const category = /業界|競合|キャリア|市場|組織|企業文化|競争戦略/.test(
      entry.title,
    )
      ? groups[5]
      : (groups.find((group) => group.matches.test(entry.title)) ?? groups[5]);
    category.entries.push(entry);
  }
  return groups;
}
