import data from "./data/curriculum.json";
import type { ShortQuestion, Theme } from "./short-model";
import type { Category } from "./model";
import type { Question } from "./model";
import { makeRubric } from "./questions";

export const curriculumRegistry = data;
export const curriculumScopes = [
  { id: "decision", title: "顧客課題・技術判断" },
  { id: "ic", title: "IC選定演習（採用記載製品）" },
  { id: "notion", title: "Notion由来のDesign Win演習" },
  ...data.sources.map((source) => ({ id: source.id, title: source.title })),
];

function classify(text: string): { theme: Theme; category: Category } {
  if (/絶縁|保護|ノイズ|ESD|EMI|CMTI/.test(text))
    return { theme: "protection", category: "保護" };
  if (
    /電源|降圧|昇圧|Buck|LDO|充電|熱|補償|位相|コンデンサ|リップル/.test(text)
  )
    return { theme: "power", category: "電源" };
  if (/ADC|DAC|アンプ|測定|電流|センサ|AFE/.test(text))
    return { theme: "sensing", category: "アナログ" };
  if (/通信|Ethernet|CAN|UART|SPI|I2C|PHY|無線|RF|BLE|Thread/.test(text))
    return { theme: "communication", category: "産業通信" };
  if (/MCU|CPU|MPU|DSP|制御|PWM/.test(text))
    return { theme: "series", category: "MCU" };
  return { theme: "system", category: "システム設計" };
}

export const industrialDrills: Question[] = data.advancedDrills.map(
  (drill) => ({
    id: drill.id,
    mode: "virtual",
    title: `初動訓練：${drill.title}`,
    category: [
      /Ethernet|EtherCAT/.test(drill.title)
        ? "産業通信"
        : /C2000/.test(drill.title)
          ? "リアルタイム制御"
          : /AM62A/.test(drill.title)
            ? "Processor"
            : "MCU",
    ],
    difficulty: 3,
    brief: `架空の初動訓練です。${drill.title}。型番の置換を急がず、要件・再現条件・電源/信号/ソフトの境界を整理してください。実際の採用理由や正常条件は未確認です。`,
    stages: [
      "まず顧客に確認する情報と、不明・仮定の条件を分けてください。",
      "revision / SDK / EVMとの差分 / 再現条件を整理します。数値条件は提示されていません。",
      `参考資料：${drill.source} / SHA256 ${drill.sha256}`,
    ],
    rubric: makeRubric(
      ["再現", "EVM", "波形", "条件"],
      "原因は未確定。調査順・追加質問・検証計画を説明する。",
    ),
    reference: `${drill.text}\n参照：${drill.source}\nSHA256：${drill.sha256}\nこの初動チェックリストは原因や採用理由が確定した正解ではありません。`,
    urls: [],
  }),
);

export const importedQuestions: ShortQuestion[] = data.questions
  .filter((question) => question.status === "ready")
  .map((question, index) => {
    const { theme, category } = classify(
      question.category + " " + question.question,
    );
    const level = /ループ|RHP|補償|位相余裕|ゲイン余裕|FMEDA/.test(
      question.question,
    )
      ? 2
      : 1;
    const options = question.answers.map((text, option) => ({
      id: `source-option-${option}`,
      text,
      explanation:
        option === 0
          ? question.explanation
          : `提示された条件ではこの選択を採りません。${question.explanation} 別条件での適合は追加検証が必要です。`,
    }));
    const offset = index % 4;
    const related = data.sources.filter((source) =>
      question.sourceIds.includes(source.id),
    );
    const isBlock =
      question.kind === "block-diagram" &&
      /経路|帰還|流れ|ブロック図|信号/.test(question.question);
    return {
      id: `curriculum-${question.id}`,
      conceptId: `curriculum-${question.id}`,
      level,
      estimatedMinutes: level === 1 ? 1 : 3,
      evidenceConfidence: "source-recorded",
      theme,
      category: [category],
      kind: isBlock ? "block-diagram" : "choice",
      sourceIds: question.sourceIds,
      ...(isBlock
        ? {
            blockDiagram:
              "電源・保護 → センサ/入力 → 信号処理・変換 → 判断/制御 → 出力・負荷\n                              ↑ 帰還・診断・故障停止 ←",
          }
        : {}),
      title: question.topic
        ? question.category + "：要求と機能を照合"
        : question.question,
      selection: {
        prompt: question.topic
          ? question.question
          : `顧客の回路・システム設計レビューです。${question.question}`,
        correctId: "source-option-0",
        options: [...options.slice(offset), ...options.slice(0, offset)],
      },
      ...(level === 2
        ? {
            reason: {
              prompt: "この条件で判断する理由は？",
              correctId: "reason-0",
              options: [
                question.explanation,
                "動作条件が変わっても元資料の数値を無条件に流用できるため。",
                "定格・温度・負荷・配線の確認を省略できるため。",
                "製品のメーカー名だけで技術的成立を証明できるため。",
              ].map((text, reason) => ({
                id: `reason-${reason}`,
                text,
                explanation:
                  reason === 0
                    ? question.explanation
                    : "要求条件・根拠・適用範囲の確認を省略する理由にはなりません。",
              })),
            },
          }
        : {}),
      hints: [
        "顧客が必要とする機能と、入力・処理・出力・電源のどこを比較するかに着目します。",
        `検討する領域：${question.category}。品番より方式と動作条件を照合します。`,
        ["source-option-0", `source-option-${1 + (index % 3)}`],
      ],
      basic: question.explanation.split(/(?<=。)/)[0],
      detailed:
        question.explanation +
        " 個別製品の成立性・採用理由とは別の教材上の判断です。",
      customerChecks: [
        "元資料の条件と顧客の電圧・電流・温度・速度・安全要求は一致していますか？",
      ],
      relatedProducts: [question.category],
      sources: related.map((source) => ({
        url: "",
        section: `${source.title} / ${question.source} / ${question.id}。教材記載（外部未検証）`,
        checkedAt: "",
        scope: "reference" as const,
        localPath: source.path,
        sha256: source.sha256,
      })),
      advancedIds: [],
    };
  });
