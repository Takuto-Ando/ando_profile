import {
  categories,
  type Category,
  type Dataset,
  type Question,
  type Rubric,
} from "./model";
import { eligibleRecord } from "./importer";

export function makeRubric(domain: string[], expected: string): Rubric {
  return {
    requirements: {
      topics: [
        domain,
        ["確認", "質問", "不足", "不明"],
        ["ms", "μs", "us", "V", "電圧", "精度", "温度", "期限"],
      ],
      expected: `課題を制約・定量目標に分解する。${expected} 不明な条件は質問として列挙する。`,
    },
    architecture: {
      topics: [
        ["入力", "センサ", "sensor"],
        ["処理", "MCU", "制御", "processor"],
        ["出力", "電源", "保護", "通信"],
      ],
      expected:
        "信号と電力の経路を明示し、処理・通信・保護の境界とボトルネックを説明する。必要なブロックは案件ごとに変わる。",
    },
    selection: {
      topics: [
        [
          "TI",
          "TPS",
          "TMS",
          "AM2",
          "AM6",
          "MSP",
          "ISO",
          "CC2",
          "INA",
          "型番",
          "製品群",
        ],
        ["データシート", "datasheet", "定格", "仕様", "未確認"],
        domain,
      ],
      expected: `${expected} 候補の機能と顧客要件を対応づけ、未検証の定格や認定を断言しない。別の合理的な候補、選定保留も許容する。`,
    },
    competition: {
      topics: [
        ["STM32", "Renesas", "ADI", "NXP", "Infineon", "他社", "既存", "維持"],
        ["比較", "コスト", "性能", "供給", "移行", "置換"],
        ["条件", "リスク", "ソフト", "評価", "検証"],
      ],
      expected:
        "現行品を含む候補を同じ条件で比較する。ソフト資産・認証・移行費を含め、要件を満たすなら現行維持も合理的。競合の弱点を捏造しない。",
    },
    proposal: {
      topics: [
        ["評価", "PoC", "試作", "検証"],
        ["日程", "週", "期限", "担当", "意思決定", "顧客"],
        ["合格", "基準", "条件", "成功", "次回"],
      ],
      expected:
        "顧客の決定者と技術担当を確認し、期限・担当・評価の合格基準を合意する。達成できない場合の撤退／現行維持条件も提示する。",
    },
  };
}
type Scenario = [
  string,
  string,
  Category[],
  1 | 2 | 3,
  string,
  string,
  string[],
  string,
];
const scenarios: Scenario[] = [
  [
    "servo",
    "サーボの制御周期を守る",
    ["MCU", "リアルタイム制御", "システム設計"],
    3,
    "架空の産業サーボメーカー。電流制御周期50μs、24V系、既存ソフトあり。PWM更新が通信処理と重なると遅延する。安全要求の詳細は未提示。",
    "TMS320F280039Cをリアルタイム制御の検討候補とする。ADC取得→演算→PWM更新の最悪時間を測る。通信分離案や現行MCU継続案も比較する。ゲートドライバ、電流検出、電源、保護は別に設計する。",
    ["制御", "PWM", "周期"],
    "TMS320F280039C",
  ],
  [
    "ethernet",
    "産業Ethernet機器の仕様を固める",
    ["産業通信", "MCU", "システム設計"],
    3,
    "架空のI/O機器メーカー。EtherCAT対応を要求、更新周期1msを目標とする。認証の期限は6か月後。既存基板の流用範囲とスタック契約は未確認。",
    "AM2434を産業通信の検討候補とする。PRU_ICSSG、PHY、電源、外部メモリ要否を確認する。プロトコルソフトのライセンスと認証、実負荷のジッタを実測する。製品の機能対応だけでシステム認証を満たすとは言えない。",
    ["EtherCAT", "通信", "ジッタ"],
    "AM2434",
  ],
  [
    "sensor",
    "センサ制御基板を小型化する",
    ["MCU", "アナログ", "電源"],
    1,
    "架空の計測器メーカー。温度センサ4chを1kHzで収集しUARTへ送信。24V入力、小型基板、精度目標とノイズ条件は未定。",
    "MSPM0G3507をMCU候補として、ADC、タイマ、UARTと必要なアナログ前段を検討する。センサ誤差、基準電圧、ADC誤差、基板ノイズを積み上げる。変換回路と保護も設計し、外付けADCが必要かは精度予算で決める。",
    ["精度", "ADC", "センサ"],
    "MSPM0G3507",
  ],
  [
    "hmi",
    "Linux HMIのシステム構成",
    ["Processor", "システム設計", "電源"],
    2,
    "架空の装置メーカー。Linuxとタッチ画面を持つ操作盤を新規開発。起動時間3秒を希望するが、画面サイズ、周辺I/O、保守期間は未確定。制御ループを同居させるかも未定。",
    "AM625をLinux HMIの検討候補とする。DDR、ストレージ、PMIC、画面I/Fと起動時間の内訳を検討する。厳密な実時間制御が必要なら担当処理を分離し、OSの平均応答だけで保証しない。",
    ["Linux", "起動", "画面"],
    "AM625",
  ],
  [
    "isolation",
    "モータ盤の絶縁境界を決める",
    ["絶縁", "保護", "システム設計"],
    2,
    "架空の産業制御盤メーカー。モータ周辺のノイズでSPI通信が乱れる。制御側と電力側の絶縁を検討中。使用電圧、過渡条件、適用規格は未提示。",
    "ISO7741をデジタル絶縁の候補とする。チャネル数と方向、速度、遅延、CMTI、動作電圧と沿面距離をデータシートと規格で照合する。信号の絶縁だけで電源が絶縁されるわけではない。絶縁電源と基板配置も検討する。",
    ["絶縁", "ノイズ", "SPI"],
    "ISO7741",
  ],
  [
    "wireless",
    "電池駆動センサを無線化する",
    ["無線", "MCU", "電源"],
    2,
    "架空の工場設備メーカー。電池駆動の後付け温度センサ。BLEで10秒ごとに送信し2年稼働を希望。通信距離、電池容量、設置環境は未確定。",
    "CC2340R5をBluetooth LEの検討候補とする。平均消費電流を測定し、電池容量・自己放電・温度・再送を含めて寿命を見積もる。金属筐体、アンテナ、無線認証、更新手段も確認する。2年稼働を型番だけで保証しない。",
    ["BLE", "電池", "無線"],
    "CC2340R5",
  ],
  [
    "current",
    "PWM環境で電流を測る",
    ["アナログ", "リアルタイム制御", "車載"],
    2,
    "架空の車載補機メーカー。PWM駆動時に電流計測が乱れる。シャント方式を検討。コモンモード、電流範囲、過渡、精度予算、車載品質要件は未確定。",
    "INA240を電流検出の機能検討候補とし、車載で必要なら対応する認定・グレードの正確な型番を別途照合する。シャント、増幅器、ADCまでの誤差と帯域、PWM過渡への応答を実測する。汎用品名を車載採用品と断言しない。",
    ["電流", "PWM", "誤差"],
    "INA240",
  ],
  [
    "power",
    "24V装置の入力保護を見直す",
    ["電源", "保護", "システム設計"],
    1,
    "架空の検査装置メーカー。24V入力から3.3V/1Aを供給。ホットプラグ時にリセットが発生。逆接、突入、過渡、熱、EMIの条件は未提示。",
    "TPS2663を入力保護、TPSM63603を降圧電源の検討候補とする。定格と過渡の余裕、突入電流、保持時間、UVLO、発熱を確認する。過渡波形を先に測り、コンデンサ追加だけで解決と断言しない。",
    ["突入", "電源", "過渡"],
    "TPS2663",
  ],
];
export const virtualQuestions: Question[] = scenarios.map(
  ([id, title, category, difficulty, brief, reference, topics, product]) => ({
    id: `virtual-${id}`,
    mode: "virtual",
    title,
    category,
    difficulty,
    brief,
    stages: [
      "顧客への追加質問を整理してから候補を絞ってください。",
      "単一型番に限定せず、評価基準と撤退条件を示してください。",
    ],
    rubric: makeRubric(topics, reference),
    reference: `学習用の参考案（架空案件、採用実績ではない）: ${reference}`,
    urls: [product, ...(id === "power" ? ["TPSM63603"] : [])].map(
      (part) => `https://www.ti.com/product/${part}`,
    ),
  }),
);
const incumbents = ["STM32", "Renesas", "ADI", "NXP", "Infineon"];
export const competitionQuestions: Question[] = incumbents.map(
  (vendor, index) => {
    const base = virtualQuestions[[0, 2, 6, 3, 7][index]];
    return {
      ...base,
      id: `competition-${vendor}`,
      mode: "competition",
      title: `${vendor}採用顧客：置換する価値はあるか`,
      category: [...new Set<Category>([...base.category, "競合比較"])],
      difficulty: 3,
      brief: `架空案件。${vendor}のソリューションを採用する顧客。現行品の型番と性能は未確認。${base.brief} 顧客は既存ソフトと検証費を重視し、現行品で目標を達成していれば変更しない方針。`,
      reference: `${base.reference}\n現行型番と実測値を確認する。TIへの変更効果が移行・再認証・教育費を上回る根拠がなければ、現行維持または周辺部品のみの提案を選べる。${vendor}製品の具体的な性能劣位は設定していない。`,
    };
  },
);
function inferCategories(text: string): Category[] {
  const rules: [Category, RegExp][] = [
    ["MCU", /MCU|MSP|マイコン|C2000/i],
    ["Processor", /OMAP|Sitara|processor|AM6|プロセッサ/i],
    ["リアルタイム制御", /モータ|サーボ|PWM|制御/],
    ["産業通信", /EtherCAT|Ethernet|RS.?485|産業通信/i],
    ["電源", /電源|PMIC|TPS|Buck|充電/i],
    ["アナログ", /ADC|DAC|アンプ|センサ|アナログ/i],
    ["絶縁", /絶縁|ISO\d/],
    ["保護", /保護|ESD|過電流/i],
    ["車載", /車載|Automotive/i],
    ["無線", /BLE|Wi-Fi|無線|Bluetooth/i],
  ];
  const found = rules
    .filter(([, regex]) => regex.test(text))
    .map(([category]) => category);
  return found.length ? found : ["システム設計"];
}
export function reverseQuestions(dataset: Dataset | null): Question[] {
  return (dataset?.records ?? []).filter(eligibleRecord).map((record) => {
    const fields = record.fields;
    const category = inferCategories(
      [
        fields.industry.value,
        fields.products.value,
        fields.challenge.value,
      ].join(" "),
    );
    const difficulty =
      !record.sourceUrls.length || !fields.partNumbers.value
        ? 3
        : fields.adoptionReason.value
          ? 2
          : 1;
    return {
      id: `reverse-${record.id}`,
      mode: "reverse",
      title: `事例 ${record.id.slice(-6)} · ${fields.industry.value || "業界不明"}`,
      category,
      difficulty,
      brief: `Notion事例の逆算演習。業界: ${fields.industry.value || "不明"}。顧客の課題は非公開の場合があり、技術仮説として回答してください。初期段階では顧客・製品・型番を伏せています。`,
      stages: [
        `顧客・搭載製品（記載確認、外部未検証）: ${fields.customer.value} / ${fields.application.value}`,
        `技術課題（推定を含む）: ${fields.challenge.value}\nTIの役割（Notion記載、外部未検証）: ${record.properties["TIの役割"] || "不明"}`,
        `TI製品・製品群（記載確認、採用未検証）: ${fields.products.value || "不明"}\n採用理由は回答後に比較します。例示型番は採用型番と扱いません。`,
      ],
      rubric: makeRubric(
        category,
        "元事例の型番一致を正解条件にしない。候補と検証方法が合理的なら別解として検討する。",
      ),
      reference: `Notionに記載された参考情報（唯一の正解ではない）\n顧客: ${fields.customer.value}\n搭載製品: ${fields.application.value}\nTI製品: ${fields.products.value || "不明"}\n課題（推定）: ${fields.challenge.value}\n選定理由（推定・外部未検証）: ${fields.adoptionReason.value || "記載なし。採用理由は不明"}\n競合（言及・推定）: ${fields.competitors.value || "不明"}\n確度の元ラベル: ${record.properties["分析確度"] || "未設定"}\n参考解答の考え方: 課題を数値条件へ分解し、入力・処理・出力・電源・保護を仮設計する。候補と代替を同条件で検証し、顧客とPoC合格基準を合意する。非公開の採用理由は補完しない。`,
      urls: record.sourceUrls,
      record,
    };
  });
}
export { categories };
