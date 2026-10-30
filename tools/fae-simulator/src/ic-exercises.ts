import type { IcLibrary } from "./ic-reference";
import type { ShortQuestion } from "./short-model";

export const verifiedIcFacts = [
  {
    partNumber: "AM2434",
    role: "リアルタイム制御・産業通信MCU",
    specifications:
      "Cortex-R5F系MCUとPRU-ICSSGで制御・産業Ethernetを処理。PHYとは別機能。スタック・コア構成・時間制約・電源は個別照合。",
    section: "AM243x Rev.J / Features, Device Comparison, PRU-ICSSG",
    minInput: null,
    maxInput: null,
  },
  {
    partNumber: "TLV62090",
    role: "降圧DC/DC",
    specifications:
      "推奨入力2.5〜5.5V、出力0.8V〜VIN、出力電流3Aクラス。外付けL/C・熱・負荷過渡は別途検証。",
    section:
      "SLVSBB9F Rev.F / Features p.1, Recommended Operating Conditions p.5",
    minInput: 2.5,
    maxInput: 5.5,
  },
  {
    partNumber: "TPS2121",
    role: "2入力パワーマルチプレクサ",
    specifications:
      "2系統の電源を選択して負荷へ供給。動作入力2.8〜22V。電圧を降圧するDC/DCではない。",
    section: "TPS212x Rev.F / Features, Recommended Operating Conditions",
    minInput: 2.8,
    maxInput: 22,
  },
  {
    partNumber: "TMP451",
    role: "リモート/ローカル温度センサ",
    specifications:
      "外部接合部と内部温度を監視。供給1.7〜3.6V、I2C/SMBus。電源変換やEthernet PHYではない。",
    section: "TMP451 Rev.A / Features, Recommended Operating Conditions",
    minInput: 1.7,
    maxInput: 3.6,
  },
  {
    partNumber: "DP83826",
    role: "産業用10/100Mbps Ethernet PHY",
    specifications:
      "MACとEthernetケーブル間の物理層。MCU/MAC・磁気部品・基準クロックが別途必要。末尾E/I、MAC I/F、電圧条件は照合が必要。",
    section:
      "DP83826E/I SNLS647I Rev.I / Description p.1, Interface, Recommended Operating Conditions p.10",
    minInput: null,
    maxInput: null,
  },
];

export function icInputCompatibility(
  partNumber: string,
  min: number,
  max: number,
): "candidate" | "incompatible" | "unverified" {
  const fact = verifiedIcFacts.find((item) => item.partNumber === partNumber);
  if (
    !fact ||
    fact.minInput === null ||
    fact.maxInput === null ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min > max
  )
    return "unverified";
  return min >= fact.minInput && max <= fact.maxInput
    ? "candidate"
    : "incompatible";
}

const scenarios = [
  {
    id: "control",
    title: "産業ネットワークとリアルタイム処理を担う",
    prompt:
      "顧客は産業用制御基板で、リアルタイム処理を行うMCUと産業Ethernetの通信処理を検討しています。制御プログラムを実行する主体の初期候補は？ ケーブル側PHYは別途必要で、周期・スタック・電源・ソフト移行は未検証です。",
    correct: "AM2434",
    explanation:
      "AM2434はR5F系の処理とPRU-ICSSGによる産業通信を検討する初期候補です。PHYだけでは制御アプリを実行できず、対応スタックと最悪遅延をシステムで検証します。",
    requirements: [
      "制御プログラムの実行",
      "リアルタイム処理",
      "産業Ethernet",
      "PHY・スタック・時間予算は未検証",
    ],
  },
  {
    id: "rail",
    title: "低電圧レールを降圧で生成",
    prompt:
      "顧客の産業用センサ基板は入力3.3〜5.0Vから1.8V・1Aを生成します。スイッチング降圧を使う方針です。機能と通常入力範囲から、最初に評価する候補は？ 熱・外付け回路・過渡応答はまだ未検証です。",
    correct: "TLV62090",
    explanation:
      "TLV62090は降圧方式で、要求の入力/出力と電流は初期候補の範囲に入ります。採用決定には熱・L/C・安定性・起動の検証が必要です。",
    requirements: [
      "入力3.3〜5.0V",
      "出力1.8V / 1A",
      "スイッチング降圧",
      "量産成立は未検証",
    ],
  },
  {
    id: "mux",
    title: "主電源とバックアップを切り替える",
    prompt:
      "顧客は5Vの主電源と5Vのバックアップのどちらを負荷へ供給するか選びたいと相談しています。電圧変換ではなく、2入力の優先選択を担当する候補は？ 切替時間・許容降下・電流は追加確認します。",
    correct: "TPS2121",
    explanation:
      "TPS2121は2入力電源の選択用です。降圧回路や温度センサでこの役割を置き換えません。無瞬断の可否は負荷・容量・切替条件で評価します。",
    requirements: ["5Vの2電源", "優先選択", "電流・切替時間・降下は未確認"],
  },
  {
    id: "temperature",
    title: "離れた接合部の温度を監視",
    prompt:
      "顧客は3.3Vで動作する基板で、外部トランジスタ接合部と基板側の温度をI2C/SMBusで監視したいと要求しています。方式と供給電圧から評価へ進める候補は？ 外部接合の種類・精度・配線条件は別途確認します。",
    correct: "TMP451",
    explanation:
      "TMP451はリモート/ローカル温度監視を担い、3.3Vは供給範囲内です。接合特性・誤差・配線・アドレス・温度範囲を照合してから提案します。",
    requirements: [
      "外部接合部とローカル温度",
      "3.3V供給",
      "I2C/SMBus",
      "精度と接合の適合は未検証",
    ],
  },
  {
    id: "ethernet",
    title: "MACをEthernetケーブルへ接続",
    prompt:
      "顧客のMCUはEthernet MACを内蔵しています。100BASE-TXで工場のケーブルへ接続するため、追加する物理層の候補は？ MCU/MACとPHYは別機能とし、I/F・末尾品種・クロック・磁気部品を追加確認します。",
    correct: "DP83826",
    explanation:
      "DP83826系列は10/100Mbps Ethernet PHYです。MAC内蔵だけではケーブルへ接続できず、PHY・配線・磁気部品等を含めた設計が必要です。",
    requirements: [
      "MCUにMACあり",
      "100BASE-TX物理層",
      "MAC I/F・E/I品種・電源は未確認",
    ],
  },
  {
    id: "24v",
    title: "24V直結の降圧候補はあるか",
    prompt:
      "顧客は24V入力から直接5Vを作り、発熱を抑えたいと要求しています。表示された採用記載ICだけで、24V直結の降圧候補を確定してよいでしょうか？ 数量、負荷電流、過渡電圧、温度は未確認です。",
    correct: "ask",
    explanation:
      "この候補群に24V直結の降圧候補はありません。TLV62090は推奨入力上限5.5V、TPS2121は22Vまでで降圧器でもありません。採用実績で定格違反を正当化せず、要求確認と別候補探索へ戻ります。",
    requirements: ["24V直結", "5V出力", "低発熱", "負荷・過渡・温度は未確認"],
  },
];

export function icSelectionQuestions(
  library: IcLibrary | null,
): ShortQuestion[] {
  if (!library) return [];
  const available = verifiedIcFacts.filter((fact) =>
    library.entries.some((entry) => entry.partNumber === fact.partNumber),
  );
  if (available.length < 4) return [];
  return scenarios.flatMap((scenario, index) => {
    if (
      scenario.correct !== "ask" &&
      !available.some((fact) => fact.partNumber === scenario.correct)
    )
      return [];
    const facts =
      scenario.correct === "ask"
        ? available.filter((fact) =>
            ["TLV62090", "TPS2121", "TMP451"].includes(fact.partNumber),
          )
        : [
            available.find((fact) => fact.partNumber === scenario.correct)!,
            ...available.filter((fact) => fact.partNumber !== scenario.correct),
          ].slice(0, 4);
    if (scenario.correct === "ask" && facts.length !== 3) return [];
    return ([1, 2, 3] as const).map((level) => {
      const choices = (
        scenario.correct === "ask" ? facts.slice(0, 3) : facts
      ).map((fact) => ({
        id: fact.partNumber,
        text: `${fact.partNumber}｜${fact.role}\n${fact.specifications}`,
        explanation:
          fact.partNumber === scenario.correct
            ? scenario.explanation
            : `${fact.role}を担当するICであり、この要求を満たす候補としては選びません。${scenario.id === "24v" ? "24V直結の定格と降圧機能を優先して照合します。" : "提示された担当機能と要求を比較してください。"}`,
      }));
      if (scenario.correct === "ask")
        choices.push({
          id: "ask",
          text: "追加確認・別候補を探す｜この一覧から24V直結降圧を確定しない",
          explanation: scenario.explanation,
        });
      const candidates = facts.map((fact) => {
        const entry = library.entries.find(
          (item) => item.partNumber === fact.partNumber,
        )!;
        return {
          partNumber: fact.partNumber,
          role: fact.role,
          specifications: fact.specifications,
          adoption: entry.adoptionExample || "元資料でも採用先不明",
          confidence: `${entry.adoptionEvidence}（元記載・採用理由は未確認）`,
          datasheetUrl: `https://www.ti.com/lit/ds/symlink/${fact.partNumber === "DP83826" ? "dp83826e" : fact.partNumber.toLowerCase()}.pdf`,
          compatibility:
            scenario.id === "24v"
              ? fact.partNumber === "DP83826"
                ? ("unverified" as const)
                : ("incompatible" as const)
              : fact.partNumber === scenario.correct
                ? ("candidate" as const)
                : ("incompatible" as const),
          reason:
            fact.partNumber === scenario.correct
              ? scenario.explanation
              : "要求担当機能に不適合。個別の別用途での成立は未検証。",
          alternatives: [
            "同じ要求を満たす他社候補も比較する。具体型番は未確認",
          ],
        };
      });
      return {
        id: `ic-selection-${scenario.id}-lv${level}`,
        conceptId: `ic-selection-${scenario.id}`,
        level,
        estimatedMinutes: level === 1 ? 1 : level === 2 ? 3 : 5,
        evidenceConfidence: "primary-checked",
        theme:
          scenario.id === "control"
            ? "series"
            : scenario.id === "ethernet"
              ? "communication"
              : scenario.id === "temperature"
                ? "sensing"
                : "power",
        category: [
          scenario.id === "control"
            ? "リアルタイム制御"
            : scenario.id === "ethernet"
              ? "産業通信"
              : scenario.id === "temperature"
                ? "アナログ"
                : "電源",
        ],
        title: scenario.title,
        kind: "ic-selection",
        sourceIds: ["ic"],
        selection: {
          prompt: scenario.prompt,
          correctId: scenario.correct,
          options: [
            ...choices.slice(index % 4),
            ...choices.slice(0, index % 4),
          ],
        },
        ...(level === 2
          ? {
              reason: {
                prompt: "候補選定の理由として適切なのは？",
                correctId: "reason-0",
                options: [
                  scenario.explanation,
                  "採用記載があるため今回の動作条件も無条件で成立する。",
                  "TI製品であることだけで競合より優れていると判断する。",
                  "絶対最大定格内なら通常動作・熱・過渡の確認は不要である。",
                ].map((text, reason) => ({
                  id: `reason-${reason}`,
                  text,
                  explanation:
                    reason === 0
                      ? scenario.explanation
                      : "採用の記載と今回の要件適合は別です。仕様・根拠と比較条件を確認します。",
                })),
              },
            }
          : {}),
        hints: [
          "要求機能と通常動作範囲を先に照合します。",
          "降圧・電源選択・温度監視・Ethernet PHYは別の担当機能です。",
          [
            scenario.correct,
            choices.find((choice) => choice.id !== scenario.correct)!.id,
          ],
        ],
        basic: scenario.explanation.split("。")[0] + "。",
        detailed:
          scenario.explanation +
          " これは初期候補選定の学習で、システム成立確認済みを意味しません。",
        relatedProducts: facts.map((fact) => fact.partNumber),
        customerChecks: scenario.requirements,
        icSelection: { requirements: scenario.requirements, candidates },
        sources: [
          ...facts.map((fact, factIndex) => ({
            url: candidates[factIndex].datasheetUrl,
            section: fact.section,
            checkedAt: "2026-10-20",
            scope: "concept" as const,
          })),
          {
            url: "",
            section:
              "IC Master / IC 詳細解説。採用記載と今回の適合は別、採用理由は未確認。",
            localPath: library.source.path,
            sha256: library.source.sha256,
            checkedAt: "",
            scope: "reference" as const,
          },
        ],
        advancedIds: facts.map((fact) => `ic-case-${fact.partNumber}`),
      };
    });
  });
}
