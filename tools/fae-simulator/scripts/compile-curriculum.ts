import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import { DOMParser } from "linkedom";
import { format, resolveConfig } from "prettier";
import { decisionQuestions } from "../src/decision-questions";

const root = resolve(process.argv[2] ?? "../../../ti_block_diagrams");
const output = resolve(process.argv[3] ?? "src/data/curriculum.json");
const definitions = [
  ["index", "TI学習教材一覧", "TI_Study_Index.html"],
  ["quiz-index", "TI クイズ一覧", "quizzes/TI_Quiz_Index.html"],
  ["product", "TI 用途・特徴クイズ", "quizzes/TI_Product_Quiz.html"],
  [
    "digital",
    "TI デジタルセミナークイズ",
    "quizzes/TI_Digital_Seminar_Quiz.html",
  ],
  ["block", "TI ブロック図・回路クイズ", "quizzes/TI_Block_Diagram_Quiz.html"],
  [
    "analog",
    "TI アナログセミナークイズ",
    "quizzes/TI_Analog_Seminar_Quiz.html",
  ],
  ["seminar", "TI セミナークイズ", "quizzes/TI_Seminar_Quiz.html"],
  [
    "industrial",
    "装置・製品・問い合わせで学ぶTI産業FAE",
    "study/TI_Industrial_FAE_Study.html",
  ],
  ["lab", "TI Product Learning Lab", "TI_Product_Learning_Lab.html"],
  ["taxonomy", "TI Product Taxonomy", "TI_Product_Taxonomy.html"],
  [
    "roadmap",
    "TI製品を分類から覚える学習ロードマップ",
    "study/TI_Product_Memory_Study.html",
  ],
  [
    "block-study",
    "ブロック図で理解するTIの電子システム",
    "study/TI_Block_Diagram_Study.html",
  ],
  ["digital-study", "TI組込みセミナー学習ノート", "semi/TI_Seminar_Study.html"],
  [
    "psds",
    "TI PSDS 2026｜アナログ電源設計の学習ノート",
    "semi_an/PSDS_2026/TI_PSDS_2026_Study.html",
  ],
] as const;

function literal(node: ts.Expression): unknown {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((element) => literal(element as ts.Expression));
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.map((property) => {
        if (
          !ts.isPropertyAssignment(property) ||
          !property.name ||
          ts.isComputedPropertyName(property.name)
        )
          throw new Error("non-static object");
        return [
          ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
            ? property.name.text
            : property.name.getText(),
          literal(property.initializer),
        ];
      }),
    );
  throw new Error("Only static JSON-like literals are accepted");
}
function declaration(code: string, name: string): unknown {
  const ast = ts.createSourceFile(
    "source.js",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  let result: unknown;
  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer
    )
      result = literal(node.initializer);
    else ts.forEachChild(node, visit);
  }
  visit(ast);
  return result;
}
type Raw = {
  id: string;
  category: string;
  question: string;
  answers: string[];
  explanation: string;
  source: string;
};
type Entry = Raw & {
  sourceIds: string[];
  aliases: string[];
  status: "ready" | "review";
  reviewReason: string;
  kind: "choice" | "block-diagram";
  topic?: boolean;
};
const sources: {
  id: string;
  title: string;
  path: string;
  sha256: string;
  fixedQuestions: number;
  referenceItems: number;
  sections: string[];
}[] = [];
const questions: Entry[] = [];
const advancedDrills: {
  id: string;
  title: string;
  text: string;
  source: string;
  sha256: string;
}[] = [];
const seen = new Map<string, Entry>();
const normalized = (value: string) =>
  value.normalize("NFKC").replace(/\s+/g, "").toLowerCase();
function add(raw: Raw, sourceId: string, topic = false) {
  const key =
    normalized(raw.question) +
    JSON.stringify(raw.answers.map(normalized).sort());
  const previous = seen.get(key);
  if (previous) {
    previous.sourceIds = [...new Set([...previous.sourceIds, sourceId])];
    previous.aliases.push(`${sourceId}:${raw.id}`);
    return;
  }
  let reviewReason = "";
  const represented = decisionQuestions.some((question) =>
    question.sources.some((source) => source.section.includes(raw.id)),
  );
  if (
    raw.answers.length !== 4 ||
    new Set(raw.answers.map(normalized)).size !== 4 ||
    !raw.explanation.trim()
  )
    reviewReason = "選択肢/解説の不足・重複";
  else if (
    !topic &&
    /ロゴ|文字数|色だけ|ネジ|暗唱|全パッケージ|価格だけ|価格順/.test(
      raw.answers.slice(1).join(" "),
    )
  )
    reviewReason = "設計上意味のある誤答へ修正が必要";
  else if (
    !topic &&
    /型番.*何|シリーズ.*どれ|次のTI|CC33|CC35|GOPS|TOPS|CRA|規則|法令|IEC\s*\d|認証.*年/.test(
      raw.question,
    )
  )
    reviewReason = "型番暗記または製品/規格条件の一次照合が必要";
  else if (
    !topic &&
    /\b(?:AM\d|TPS\d|LM\d|CC\d|TMS\d|MSPM|RM\d)/i.test(raw.question)
  )
    reviewReason = "個別型番の仕様照合が必要";
  else if (
    !topic &&
    /-term-|教科書で.*教材|説明として最も適切/.test(raw.id + raw.question)
  )
    reviewReason = "用語暗記から顧客課題への再構成が必要";
  if (represented) reviewReason = "同じ論点の既存顧客課題へ統合済み";
  const entry: Entry = {
    ...raw,
    sourceIds: [sourceId],
    aliases: [`${sourceId}:${raw.id}`],
    status: reviewReason ? "review" : "ready",
    reviewReason,
    kind: sourceId === "block" ? "block-diagram" : "choice",
    ...(topic ? { topic: true } : {}),
  };
  questions.push(entry);
  seen.set(key, entry);
}
for (const [id, title, path] of definitions) {
  const bytes = await readFile(resolve(root, path));
  const document = new DOMParser().parseFromString(
    bytes.toString("utf8"),
    "text/html",
  );
  const scripts = [...document.querySelectorAll("script")]
    .filter((script) => !script.getAttribute("type"))
    .map((script) => script.textContent)
    .join("\n");
  const source = {
    id,
    title,
    path,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    fixedQuestions: 0,
    referenceItems: 0,
    sections: [...document.querySelectorAll("h2,h3")]
      .map((element) => element.textContent.trim())
      .filter(Boolean)
      .slice(0, 120),
  };
  if (["digital", "analog", "block", "seminar"].includes(id)) {
    const fixed = declaration(scripts, "questions") as Raw[];
    if (!Array.isArray(fixed)) throw new Error(`No questions: ${path}`);
    source.fixedQuestions = fixed.length;
    fixed.forEach((question) => add(question, id));
  } else if (id === "product") {
    const topics = declaration(scripts, "topics") as {
      id: number;
      name: string;
      category: string;
      purpose: string;
      explanation: string;
    }[];
    source.referenceItems = topics.length;
    topics.forEach((topic, index) => {
      const alternatives = topics.filter(
        (other) =>
          other.id !== topic.id &&
          other.category !== topic.category &&
          normalized(other.purpose) !== normalized(topic.purpose),
      );
      const distinct = [
        ...new Map(
          alternatives.map((other) => [normalized(other.purpose), other]),
        ).values(),
      ];
      const wrong = [
        0,
        Math.floor(distinct.length / 3),
        Math.floor((distinct.length * 2) / 3),
      ].map((offset) => distinct[(offset + index) % distinct.length]);
      add(
        {
          id: `topic-${topic.id}`,
          category: topic.category,
          question: `顧客の${topic.category}回路では「${topic.purpose}」機能が必要です。担当するブロックを、説明と要求の対応から選んでください。`,
          answers: [topic, ...wrong].map(
            (item) => `${item.name}：${item.purpose}`,
          ),
          explanation: `${topic.purpose}。${topic.explanation} 実装の電圧・電流・帯域・精度・温度条件は別途確認します。`,
          source: `TI_Product_Quiz.html / topic-${topic.id}`,
        },
        id,
        true,
      );
    });
  } else if (id === "lab") {
    const deck = JSON.parse(document.querySelector("#deck")!.textContent) as {
      products: unknown[];
    };
    source.referenceItems = deck.products.length;
  } else if (id === "taxonomy") {
    const model = declaration(scripts, "MODEL") as {
      stats: { products: number };
    };
    source.referenceItems = model.stats.products;
  } else
    source.referenceItems = document.querySelectorAll(
      "section.chapter,section.topic,details.page",
    ).length;
  sources.push(source);
  if (id === "industrial")
    for (const section of document.querySelectorAll("section.chapter")) {
      const heading = section.querySelector("h2,h3")?.textContent.trim() ?? "";
      if (
        /^[1-6]\. /.test(heading) &&
        section.textContent.includes("04_case_drills")
      )
        advancedDrills.push({
          id: `industrial-${section.id}`,
          title: heading,
          text: section.textContent.replace(/\s+/g, " ").trim(),
          source: `${path}#${section.id}`,
          sha256: source.sha256,
        });
    }
}
for (const question of questions) {
  if (question.sourceIds.includes("product"))
    question.sourceIds.push("lab", "taxonomy", "roadmap");
  if (question.sourceIds.includes("block"))
    question.sourceIds.push("block-study");
  if (question.sourceIds.includes("digital"))
    question.sourceIds.push("digital-study");
  if (question.sourceIds.includes("analog")) question.sourceIds.push("psds");
  question.sourceIds.push("index", "quiz-index");
}
const registry = {
  schemaVersion: 1,
  sources,
  questions,
  advancedDrills,
  report: {
    rawFixed: sources.reduce((sum, source) => sum + source.fixedQuestions, 0),
    unique: questions.length,
    duplicates:
      sources.reduce((sum, source) => sum + source.fixedQuestions, 0) +
      sources
        .filter((source) => source.id === "product")
        .reduce((sum, source) => sum + source.referenceItems, 0) -
      questions.length,
    ready: questions.filter((question) => question.status === "ready").length,
    review: questions.filter((question) => question.status === "review").length,
  },
};
await writeFile(
  output,
  await format(JSON.stringify(registry), {
    ...(await resolveConfig(output)),
    parser: "json",
  }),
);
process.stdout.write(
  JSON.stringify({
    output: resolve(dirname(output), "curriculum.json"),
    report: registry.report,
    sources: sources.map(({ id, fixedQuestions, referenceItems }) => ({
      id,
      fixedQuestions,
      referenceItems,
    })),
  }) + "\n",
);
