import type { Question } from "./model";
import type {
  CaseProfile,
  InterviewTopic,
  Requirement,
} from "./workflow-model";

const numeric = (
  id: string,
  label: string,
  kind: Requirement["kind"],
  unit: string,
  min?: number,
  max?: number,
  publicValue = false,
): Requirement => ({
  id,
  label,
  kind,
  unit,
  min,
  max,
  public: publicValue,
  critical: true,
  topicId: id,
  source: "scenario",
  context: "架空案件の顧客要求。製品仕様・採用実績ではない。",
});
const protocol = (
  id: string,
  label: string,
  interfaces: string[],
  publicValue = false,
): Requirement => ({
  id,
  label,
  kind: "interface",
  interfaces,
  public: publicValue,
  critical: true,
  topicId: id,
  source: "scenario",
  context: "架空案件の顧客要求",
});
const manual = (id: string, label: string): Requirement => ({
  id,
  label,
  kind: "manual",
  public: false,
  critical: false,
  topicId: id,
  source: "unknown",
  context: "定量条件・原典が不足。自動成立判定の対象外。",
});
const topic = (
  requirement: Requirement,
  keywords: string[],
  answer: string,
): InterviewTopic => ({
  id: requirement.topicId,
  label: requirement.label,
  question: `${requirement.label}の具体的な条件を教えてください。`,
  keywords,
  answer,
  importance: requirement.critical ? 3 : 1,
  known: requirement.public,
});
type Setup = { requirements: Requirement[]; topics: InterviewTopic[] };
function setup(
  requirements: Requirement[],
  answers: [string[], string][],
): Setup {
  return {
    requirements,
    topics: requirements.map((requirement, index) =>
      topic(requirement, ...answers[index]),
    ),
  };
}
const setups: Record<string, Setup> = {
  servo: setup(
    [
      numeric(
        "cycle",
        "制御周期・最悪遅延",
        "maximum",
        "us",
        undefined,
        50,
        true,
      ),
      numeric("input", "入力電源の動作範囲", "coverage", "V", 18, 30),
      protocol("communication", "制御ネットワークのI/F", ["CAN FD"]),
    ],
    [
      [
        ["周期", "遅延", "レイテンシ", "ジッタ", "cycle"],
        "制御の最悪遅延は50μs以下です。平均値だけでは受け入れません。",
      ],
      [
        ["入力電源", "電圧", "電源", "入力範囲"],
        "架空条件：24V系の動作範囲は18〜30V。選定ブロックの入力側で範囲全体を満たす必要があります。",
      ],
      [
        ["通信", "ネットワーク", "インターフェース", "CAN"],
        "架空条件：上位との通信にはCAN FDが必要です。PWM更新と独立して最悪時間を評価します。",
      ],
    ],
  ),
  ethernet: setup(
    [
      numeric("cycle", "通信更新周期", "maximum", "ms", undefined, 1, true),
      protocol("communication", "産業通信プロトコル", ["EtherCAT"], true),
      numeric("temperature", "使用周囲温度", "coverage", "°C", -20, 70),
    ],
    [
      [
        ["周期", "更新", "遅延", "ジッタ"],
        "目標更新周期は1ms以下。ソフト・通信を含む最悪値で確認してください。",
      ],
      [
        ["通信", "プロトコル", "EtherCAT", "インターフェース"],
        "EtherCATが必須です。Ethernet端子の存在だけでは対応確認になりません。",
      ],
      [
        ["温度", "環境", "動作条件", "周囲"],
        "架空条件：周囲温度-20〜70°C。チップの接合温度定格だけでは基板全体の成立を保証できません。",
      ],
    ],
  ),
  sensor: setup(
    [
      numeric(
        "sampling",
        "センサ収集周波数",
        "minimum",
        "Hz",
        1000,
        undefined,
        true,
      ),
      numeric("input", "入力電源の動作範囲", "coverage", "V", 18, 30),
      protocol("communication", "外部出力I/F", ["UART"], true),
    ],
    [
      [
        ["周波数", "サンプル", "サンプリング", "収集", "周期"],
        "各chを1kHz以上で収集する要求です。ch切替・演算・送信も確認してください。",
      ],
      [
        ["電源", "電圧", "入力範囲"],
        "架空条件：24V入力の許容動作範囲は18〜30Vです。MCUへ直接印加する条件ではありません。",
      ],
      [
        ["UART", "通信", "インターフェース", "出力"],
        "UART出力が必須です。物理層や信号レベルは別途確認が必要です。",
      ],
    ],
  ),
  hmi: setup(
    [
      numeric("boot", "起動時間", "maximum", "s", undefined, 3, true),
      protocol("display", "表示パネルI/F", ["OLDI"]),
      numeric("temperature", "周囲温度", "coverage", "°C", 0, 60),
    ],
    [
      [
        ["起動", "ブート", "boot"],
        "電源投入から操作画面表示まで3秒以下が目標です。プロセッサ単体の起動時間とは区別してください。",
      ],
      [
        ["画面", "表示", "パネル", "インターフェース"],
        "架空条件：パネル接続はOLDIです。採用パネルの信号・タイミングを確認してください。",
      ],
      [
        ["温度", "環境", "動作条件"],
        "架空条件：筐体周囲0〜60°Cで使用します。筐体内の温度上昇を含めて確認してください。",
      ],
    ],
  ),
  isolation: setup(
    [
      protocol("communication", "絶縁する信号I/F", ["SPI"], true),
      numeric("delay", "信号経路の許容遅延", "maximum", "ns", undefined, 100),
      manual("safety", "絶縁方式・安全規格・沿面距離"),
    ],
    [
      [
        ["SPI", "通信", "インターフェース", "信号"],
        "SPIの信号を絶縁します。各チャネルの方向とクロック条件は追加確認が必要です。",
      ],
      [
        ["遅延", "速度", "タイミング"],
        "架空条件：対象信号経路の許容伝搬遅延は100ns以下です。必要帯域と方向も確認してください。",
      ],
      [
        ["絶縁", "安全", "規格", "沿面", "電圧"],
        "使用電圧と適用規格はまだ合意されていません。データシートの耐圧だけで安全成立とは判断できません。",
      ],
    ],
  ),
  wireless: setup(
    [
      numeric("interval", "定期送信間隔", "maximum", "s", undefined, 10, true),
      protocol("communication", "無線プロトコル", ["BLE"], true),
      manual("battery", "電池寿命・通信距離・再送条件"),
    ],
    [
      [
        ["間隔", "周期", "送信", "頻度"],
        "10秒ごとに送信します。再送や接続維持に伴う追加消費も確認してください。",
      ],
      [
        ["無線", "BLE", "Bluetooth", "プロトコル"],
        "Bluetooth LEを使用します。Wi-Fiや独自無線だけの構成は要求と異なります。",
      ],
      [
        ["電池", "寿命", "距離", "再送", "消費"],
        "2年稼働が目標ですが、電池容量と設置環境が未決定です。寿命を自動判定する根拠はありません。",
      ],
    ],
  ),
  current: setup(
    [
      numeric("commonmode", "測定時のコモンモード範囲", "coverage", "V", 0, 48),
      numeric("delay", "信号整定時間の目標", "maximum", "us", undefined, 5),
      manual("qualification", "車載品質グレードと過渡条件"),
    ],
    [
      [
        ["コモン", "電圧", "電流範囲", "入力範囲"],
        "架空条件：測定点のコモンモード範囲は0〜48Vです。MCU電源電圧と混同しないでください。",
      ],
      [
        ["整定", "応答", "遅延", "帯域"],
        "架空条件：対象の整定時間目標は5μs以下です。振幅・誤差帯を含めた測定条件はさらに確認が必要です。",
      ],
      [
        ["車載", "品質", "認定", "グレード", "過渡"],
        "車載の認定・グレードと過渡条件は未確定です。汎用品名だけで適合とは扱えません。",
      ],
    ],
  ),
  power: setup(
    [
      numeric("input", "装置入力電源の動作範囲", "coverage", "V", 18, 30),
      numeric("output", "必要出力電圧", "coverage", "V", 3.3, 3.3, true),
      numeric(
        "current",
        "必要連続出力電流",
        "minimum",
        "A",
        1,
        undefined,
        true,
      ),
    ],
    [
      [
        ["入力", "電源", "電圧範囲", "過渡"],
        "架空条件：定常入力は18〜30Vです。過渡と逆接条件は別途未確定です。",
      ],
      [
        ["出力電圧", "3.3", "レール"],
        "必要出力は3.3Vです。ここでは公称値を照合し、リップルや精度は別途検証します。",
      ],
      [
        ["電流", "負荷", "容量"],
        "連続出力1Aが必要です。ピーク・温度・熱制限でのディレーティングを確認してください。",
      ],
    ],
  ),
};
export function profileFor(question: Question): CaseProfile {
  if (question.mode === "reverse") {
    const fields = question.record?.fields;
    const requirements = [
      manual("requirements", "顧客課題と定量目標"),
      manual("adoption", "搭載確認と採用理由"),
      manual("incumbent", "現行製品と移行制約"),
    ];
    return {
      version: 1,
      fictional: false,
      requirements,
      topics: [
        topic(
          requirements[0],
          ["要件", "課題", "周期", "電圧", "温度", "精度"],
          `元資料記載（推定含む）: ${fields?.challenge.value || "不明"}。定量条件は原典から自動確定できません。顧客確認が必要です。`,
        ),
        topic(
          requirements[1],
          ["採用", "搭載", "理由", "根拠", "型番"],
          `TI製品欄: ${fields?.products.value || "不明"}。選定理由欄: ${fields?.adoptionReason.value || "記載なし"}。搭載の独立確認と理由の公開確認は別々に必要です。`,
        ),
        topic(
          requirements[2],
          ["競合", "現行", "移行", "ソフト", "コスト"],
          `他社への言及: ${fields?.competitors.value || "不明"}。現行構成・移行工数は原本に根拠がなければ未確認です。`,
        ),
      ],
      counter: null,
    };
  }
  const competitionMap: Record<string, string> = {
    STM32: "servo",
    Renesas: "sensor",
    ADI: "current",
    NXP: "hmi",
    Infineon: "power",
  };
  const key =
    question.mode === "competition"
      ? competitionMap[question.id.replace("competition-", "")]
      : question.id.replace("virtual-", "");
  const base = setups[key];
  if (!base)
    return {
      version: 1,
      fictional: true,
      requirements: [],
      topics: [],
      counter: null,
    };
  const business: InterviewTopic[] = [
    {
      id: "migration",
      label: "既存資産・移行工数",
      question: "既存ソフトと移行に使える工数を教えてください。",
      keywords: ["移行", "既存", "ソフト", "工数", "教育"],
      answer:
        "架空条件：既存ソフトを維持したい方針です。新規移行に使える工数は40時間まで。超える場合は次期モデルで検討します。",
      importance: 3,
      known: false,
    },
    {
      id: "commercial",
      label: "BOM・数量・供給・評価日程",
      question: "予算、数量、供給条件、評価期限を教えてください。",
      keywords: ["BOM", "予算", "価格", "数量", "供給", "納期", "日程", "期限"],
      answer:
        "架空条件：初回1000台、4週間後に評価判定。BOM・在庫・量産供給は正式見積が必要で、現時点で未確認です。",
      importance: 2,
      known: false,
    },
  ];
  const counterRequirement = numeric(
    "counter-temperature",
    "追加条件：周囲温度",
    "coverage",
    "°C",
    -20,
    85,
    true,
  );
  const migrationRequirement = numeric(
    "migration-budget",
    "最大移行工数",
    "maximum",
    "h",
    undefined,
    40,
  );
  migrationRequirement.topicId = "migration";
  migrationRequirement.critical = false;
  return structuredClone({
    version: 1,
    fictional: true,
    ...base,
    requirements: [...base.requirements, migrationRequirement],
    topics: [...base.topics, ...business],
    counter: {
      message:
        "架空の追加条件：屋外筐体へ展開し、周囲温度-20〜85°Cへの対応が必要になりました。既存候補の根拠を見直し、維持・切替・保留を再判断してください。",
      requirement: counterRequirement,
    },
  });
}
