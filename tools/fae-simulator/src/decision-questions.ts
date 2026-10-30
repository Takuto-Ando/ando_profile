import type { ShortQuestion, Theme, ChoiceTask } from "./short-model";
import type { Category } from "./model";

type Scenario = {
  id: string;
  theme: Theme;
  category: Category;
  title: string;
  problem: string;
  actions: [string, string, string, string];
  feedback: [string, string, string, string];
  check: string;
  products: string[];
  cases: string[];
  material: string;
};

const scenarios: Scenario[] = [
  {
    id: "secureboot",
    theme: "system",
    category: "MCU",
    title: "更新ファームウェアの改ざんを防ぐ",
    problem:
      "顧客は現場更新で、正規の発行元が作った改ざんされていないファームウェアだけを起動したいと要求しています。中心に据える仕組みは？",
    actions: [
      "信頼する鍵に基づく署名検証と起動時の検証経路を設計する",
      "通信を暗号化すれば起動イメージの検証は省略する",
      "ファイル名が同じなら正規イメージと判断する",
      "CRCが合えば発行元の正当性まで証明済みとする",
    ],
    feedback: [
      "署名による真正性・完全性の検証と鍵の信頼経路を設計します。",
      "通信の秘匿と起動イメージの真正性は別です。",
      "名前だけでは内容も発行元も検証できません。",
      "CRCは偶発的誤りの検出であり発行元の認証ではありません。",
    ],
    check:
      "鍵の保管、更新失敗時の復帰、ロールバック対策、製品のセキュリティ要求は？",
    products: ["Secure boot", "Sitara"],
    cases: ["virtual-hmi"],
    material: "digital-3-0",
  },
  {
    id: "sdk",
    theme: "designwin",
    category: "Processor",
    title: "SDK対応だけで開発日程を約束しない",
    problem:
      "候補プロセッサはSDKの対応一覧にあります。顧客の独自基板には未確認の外部デバイスが載り、短納期で移行する計画です。採用前に優先する確認は？",
    actions: [
      "対象OS・SDK版・基板の起動と必要ドライバを小さく実証する",
      "製品名が対応一覧にあれば全デバイスのドライバも完成済みとする",
      "評価基板の画面が出れば独自基板の全機能も検証済みとする",
      "CPU性能だけで移植工数を確定する",
    ],
    feedback: [
      "製品サポートと顧客基板のソフト完成度を分けて検証します。",
      "外部デバイスや版ごとの対応は別確認です。",
      "配線・pinmux・電源・外部機器が異なります。",
      "ドライバ・起動・検証の工数はCPU性能だけでは決まりません。",
    ],
    check: "OSとSDK版、必要ドライバ、ライセンス、保守期間、移行期限は？",
    products: ["Processor SDK", "MCU+ SDK", "Sitara"],
    cases: ["virtual-hmi"],
    material: "digital-5-1",
  },
  {
    id: "on-time",
    theme: "power",
    category: "電源",
    title: "大きな降圧比と最小ON時間",
    problem:
      "理想的な損失ゼロのCCM降圧回路を48V→5V、500kHzで検討します。必要なON時間は約208nsです。実際のICを選ぶ次の確認は？",
    actions: [
      "入力範囲を含め、最小ON時間と制御方式が要求に対応するか調べる",
      "定格入力が48V以上ならON時間の確認を省く",
      "周波数を上げれば必要なON時間も長くなるとする",
      "理想計算だけで実機の過渡・熱・安定性まで確認済みとする",
    ],
    feedback: [
      "理想値D=5/48、周期2µsから約208ns。実際の制御制約は別確認です。",
      "耐圧と最小ON時間は異なる制約です。",
      "同じ降圧比なら周波数を上げるとON時間は短くなります。",
      "理想計算は実機での成立検証を代替しません。",
    ],
    check: "入力最大値、周波数の許容範囲、最小ON時間、軽負荷時の制御方式は？",
    products: ["Buck DC/DC"],
    cases: ["virtual-power"],
    material: "analog-1-0",
  },
  {
    id: "capacitor",
    theme: "power",
    category: "電源",
    title: "公称容量が同じでも電源が不安定",
    problem:
      "降圧電源のセラミック出力コンデンサを同じ公称容量の小型品に替えると、負荷変動時の電圧低下が増えました。まず比較するのは？",
    actions: [
      "DCバイアス・温度・公差を含む実効容量とESRを比較する",
      "公称容量が同じなら全使用条件で同じ容量とする",
      "耐圧定格以下ならDCバイアスの影響はゼロとする",
      "電源ICを高速CPUに替えることだけを提案する",
    ],
    feedback: [
      "実装・動作条件での容量とESRが過渡応答や安定性に影響します。",
      "公称値だけでは実使用容量は決まりません。",
      "耐圧内でも誘電体によって容量が変わります。",
      "処理速度は出力コンデンサの不足を補いません。",
    ],
    check: "実使用電圧での容量曲線、温度、ESR、電源の安定性条件は？",
    products: ["Buck DC/DC", "Power design"],
    cases: ["virtual-power"],
    material: "analog-1-2",
  },
  {
    id: "node",
    theme: "series",
    category: "MCU",
    title: "小さなセンサノードの処理構成",
    problem:
      "顧客はADCで温度を読み、タイマで周期処理し、UARTで結果を送る小型基板を設計します。OSや画面は不要です。まず検討する処理構成は？",
    actions: [
      "必要なADC・タイマ・通信を持つMCUを中心に構成する",
      "画面がなくてもLinux用プロセッサと外部DDRを必須にする",
      "ADCの出力を直接UART配線へつなぐ",
      "電流検出アンプだけで周期処理と通信を実行する",
    ],
    feedback: [
      "処理と周辺機能をまとめるMCU構成から検討できます。",
      "不要なOS・DDRは電源やソフト開発の負担を増やします。",
      "数値化と通信データの生成・制御は別の処理です。",
      "アナログ増幅だけではプログラムや通信を実行できません。",
    ],
    check: "必要な精度・サンプリング周期・メモリ・I/O電圧・消費電力は？",
    products: ["MSPM0", "MSPM0G3507"],
    cases: ["virtual-sensor"],
    material: "digital-5-0",
  },
  {
    id: "deadline",
    theme: "series",
    category: "リアルタイム制御",
    title: "制御周期に間に合わせる",
    problem:
      "モータ制御で、ADC取得から演算・PWM更新までを毎周期の締切内に終える必要があります。CPUの平均使用率は低いのに稀に締切を超えます。選定で最優先する確認は？",
    actions: [
      "割込み・取得・演算・PWM更新を含む最悪遅延を検証する",
      "CPUの公称クロックだけで成立を判断する",
      "平均使用率が低いので遅延測定を省略する",
      "PWM周波数を上げれば演算時間の問題も解消すると考える",
    ],
    feedback: [
      "締切は平均ではなく最悪経路とジッタで評価します。",
      "クロックだけでは割込みや周辺機能の遅延を表せません。",
      "平均負荷が低くても一時的な競合で締切を超えます。",
      "周期を短くすると使える演算時間はむしろ減ります。",
    ],
    check: "制御周期、許容ジッタ、取得時間、故障時の停止時間は？",
    products: ["C2000", "TMS320F280039C"],
    cases: ["virtual-servo"],
    material: "digital-4-3",
  },
  {
    id: "hmi",
    theme: "series",
    category: "Processor",
    title: "画面処理と制御を分ける",
    problem:
      "産業機器にLinuxの操作画面を追加します。画面更新が重い時も、既存の厳密な制御周期を守る必要があります。妥当な構成方針は？",
    actions: [
      "画面系と制御系の実行資源・通信・故障時動作を分けて検証する",
      "通常の画面アプリのループへ制御をそのまま移す",
      "画面のフレームレートだけで制御周期を保証する",
      "Linuxが起動すれば最悪応答時間も確認済みとする",
    ],
    feedback: [
      "OSの表示負荷と制御の締切を切り分ける設計が必要です。",
      "画面側の負荷変動が制御に影響します。",
      "表示性能と制御の最悪遅延は別指標です。",
      "起動確認は制御タイミングの検証ではありません。",
    ],
    check: "制御と画面の通信量、更新周期、起動中・通信断時の動作は？",
    products: ["Sitara", "AM625", "C2000"],
    cases: ["virtual-hmi"],
    material: "block-dbffdaa0d737",
  },
  {
    id: "rs485",
    theme: "communication",
    category: "産業通信",
    title: "工場の長い配線で通信する",
    problem:
      "工場内の20mのケーブルで複数装置を接続します。顧客はRS-485のバス仕様を採用済みですが、MCUにはUART端子しかありません。必要な対応は？",
    actions: [
      "差動トランシーバを介し、終端・配線・電位差を確認する",
      "UART端子をそのまま長いバスへ直結する",
      "ボーレート設定だけで物理層への対応を完了する",
      "各端末に無条件で終端を追加し配線形状は問わない",
    ],
    feedback: [
      "UARTの論理信号とバスの電気特性を分けて設計します。",
      "UART端子はRS-485の差動物理層ではありません。",
      "速度設定だけでは電圧やノイズ耐性を解決できません。",
      "終端はバス形状・位置・負荷を考えて配置します。",
    ],
    check: "半二重か、速度・配線形状・GND電位差・絶縁要求は？",
    products: ["THVD1450", "RS-485 transceiver"],
    cases: ["virtual-sensor"],
    material: "TI_Product_Quiz.html / RS-485",
  },
  {
    id: "can",
    theme: "communication",
    category: "産業通信",
    title: "CAN対応MCUなのに接続できない",
    problem:
      "CANコントローラ内蔵MCUを選びました。基板を工場のCANバスに接続したい顧客へ、物理層の設計として提案するのは？",
    actions: [
      "対応するCANトランシーバと終端・保護・配線を検討する",
      "コントローラ内蔵なのでTX/RXをCANH/CANLへ直結する",
      "UARTのボーレート変更だけでCANへ置き換える",
      "CANフレームが作れれば配線や電圧の確認を終える",
    ],
    feedback: [
      "コントローラと物理層は役割が異なります。",
      "論理端子と差動バス端子は同一ではありません。",
      "フレーム処理も物理層も異なります。",
      "データ形式の成立と電気的成立は別確認です。",
    ],
    check: "CAN/CAN FD、データレート、電源、終端、保護、絶縁は？",
    products: ["TCAN1042H"],
    cases: ["virtual-servo"],
    material: "block-5a5c0be8df76",
  },
  {
    id: "i2c",
    theme: "communication",
    category: "MCU",
    title: "同じアドレスのセンサを増設する",
    problem:
      "同一I2Cバスへ、変更できない同じアドレスのセンサを2個追加したい顧客です。誤った応答を避けるための対応は？",
    actions: [
      "バス分離やマルチプレクサで同時応答を避ける構成を検討する",
      "そのまま並列につなぎソフトで個体名だけ変える",
      "プルアップ抵抗を小さくすればアドレス衝突もなくなる",
      "クロックを下げるだけで各個体を選択できるとする",
    ],
    feedback: [
      "固定アドレスの衝突は相手を電気的に選別できる構成で解決します。",
      "ソフト内の名前はバス上のアドレスを変えません。",
      "プルアップは立上り等に関係し、アドレスは変えません。",
      "速度を変えても同一アドレスへの同時応答は残ります。",
    ],
    check: "アドレス変更可否、バス容量、電圧、センサの同時取得要件は？",
    products: ["I2C switch / multiplexer", "MSPM0"],
    cases: ["virtual-sensor"],
    material: "TI_Product_Quiz.html / I2C",
  },
  {
    id: "buck",
    theme: "power",
    category: "電源",
    title: "24Vから5Vを作る熱の問題",
    problem:
      "24V入力から5V・1Aを作る産業機器です。筐体内の発熱を抑える必要があります。まず比較すべき電源方式は？",
    actions: [
      "降圧DC/DCを軸に効率・発熱・ノイズを評価する",
      "LDOなら損失を無視できるので熱評価を省く",
      "昇圧専用回路だけで5Vへ下げる",
      "直列抵抗だけで負荷変動があっても5Vを保証する",
    ],
    feedback: [
      "大きい電圧差ではスイッチング降圧の損失を比較する価値があります。",
      "LDOの主要損失は(24−5)×1=19Wで、無視できません。",
      "昇圧専用方式はこの降圧要求を満たしません。",
      "抵抗の電圧降下は負荷電流で変化します。",
    ],
    check: "入力の最大・過渡電圧、負荷変動、温度、EMI、起動条件は？",
    products: ["Buck DC/DC"],
    cases: ["virtual-power"],
    material: "block-33dcea09553a",
  },
  {
    id: "ldo",
    theme: "power",
    category: "電源",
    title: "LDOの熱を見積もる",
    problem:
      "5Vから3.3V・0.2AをLDOで作る案です。静止電流は無視できるとして、熱設計の最初の判断は？",
    actions: [
      "約0.34Wの損失を見積もり、周囲温度と基板の放熱条件を確認する",
      "0.2Aだから損失は必ず0.2Wとする",
      "出力が3.3Vなら入力電圧は熱に影響しないとする",
      "定格電流以下なら接合温度の確認を省く",
    ],
    feedback: [
      "(5−3.3)×0.2=0.34W。これだけで熱的成立を断定しません。",
      "電流だけでは電力にならず、電圧差が必要です。",
      "LDOでは電圧差が主要な損失要因です。",
      "電流定格と熱制約は別に満たす必要があります。",
    ],
    check: "入力変動、最大負荷、許容接合温度、packageと銅箔条件は？",
    products: ["TLV755P", "LDO"],
    cases: ["virtual-power"],
    material: "analog-extra-06d71522611f",
  },
  {
    id: "adc",
    theme: "sensing",
    category: "アナログ",
    title: "ADCの値が落ち着かない",
    problem:
      "高インピーダンスのセンサをSAR ADCへ直結すると、サンプリング速度を上げた時だけ誤差が増えます。最初に検討する対応は？",
    actions: [
      "取得時間と入力の整定を調べ、必要なら前段バッファを追加する",
      "ビット数の多いADCへ替えれば入力の整定は不要になる",
      "サンプリングをさらに速めて入力の充電時間を短くする",
      "前段を調べず平均化だけで系統的な誤差が消えるとする",
    ],
    feedback: [
      "入力抵抗や容量と取得時間が精度に影響します。",
      "分解能を増やしても不足した整定時間は解決しません。",
      "取得時間の不足を悪化させる可能性があります。",
      "平均化は不十分な整定という原因への対処ではありません。",
    ],
    check: "ソースインピーダンス、取得時間、入力レンジ、目標精度は？",
    products: ["SAR ADC", "Precision amplifier"],
    cases: ["virtual-sensor"],
    material: "block-7ef77ba5b3be",
  },
  {
    id: "shunt",
    theme: "sensing",
    category: "アナログ",
    title: "シャント抵抗を大きくすればよい？",
    problem:
      "10Aを1mΩのシャントで測定する回路です。検出信号を大きくしたくて抵抗値を増やす案が出ました。適切な判断は？",
    actions: [
      "現状10mV・0.1Wを基点に、信号と損失・温度・増幅誤差を比較する",
      "抵抗を増やしても電力損失は同じとする",
      "アンプのゲインだけでシャントの自己発熱をなくす",
      "10Aという値だけでアンプの入力共通モード範囲も満たすとする",
    ],
    feedback: [
      "V=IR、P=I²Rで信号と損失のトレードオフを確認します。",
      "同じ電流では抵抗増加に比例して損失が増えます。",
      "ゲインはシャントで生じる発熱を変えません。",
      "電流値と入力共通モード電圧は別の条件です。",
    ],
    check: "連続・ピーク電流、共通モード電圧、誤差予算、帯域は？",
    products: ["INA240", "Current-sense amplifier"],
    cases: ["virtual-servo"],
    material: "analog-extra-31ec882edfd1",
  },
  {
    id: "io",
    theme: "sensing",
    category: "保護",
    title: "24V信号をMCUへ取り込む",
    problem:
      "24Vの工場センサ信号を3.3V MCUのデジタル入力へつなぎたい顧客です。安全な設計の出発点は？",
    actions: [
      "電圧変換・入力しきい値・過渡保護を備える入力段を設計する",
      "ソフトで入力値を制限するので端子へ直結する",
      "直列抵抗1個だけで全ての過渡条件への適合を保証する",
      "通信速度を下げれば過電圧も解消すると考える",
    ],
    feedback: [
      "定常入力と過渡電圧の両方を端子条件に合わせます。",
      "ソフトは端子の過電圧を防げません。",
      "抵抗だけで全条件の安全性は保証できません。",
      "速度は電圧耐性の代わりにはなりません。",
    ],
    check: "入力最大値、ON/OFFしきい値、漏れ電流、絶縁とサージ条件は？",
    products: ["Industrial digital input", "ISO1211"],
    cases: ["virtual-plc"],
    material: "block-669b0a28cb35",
  },
  {
    id: "isolation",
    theme: "protection",
    category: "絶縁",
    title: "絶縁部品を入れたのにGNDがつながる",
    problem:
      "顧客は2つの回路間の直流導通をなくす必要があります。信号へデジタルアイソレータを入れましたが、電源GNDは直結したままです。次の対応は？",
    actions: [
      "信号だけでなく電源とGNDを含めて絶縁境界を見直す",
      "信号部品が絶縁品なのでGND直結のまま完了とする",
      "伝送速度を下げればGND間の直流導通もなくなる",
      "耐圧試験の数値だけで実使用時の全絶縁条件を満たすとする",
    ],
    feedback: [
      "電源やGNDに迂回経路があれば境界全体は絶縁できません。",
      "直結されたGNDは直流導通の経路です。",
      "通信速度と直流導通は別です。",
      "動作電圧・沿面距離・規格なども確認が必要です。",
    ],
    check: "動作電圧、絶縁目的、電源経路、距離、適用規格は？",
    products: ["ISO7741", "Isolated power"],
    cases: ["virtual-servo"],
    material: "block-5b547d16c9ca",
  },
  {
    id: "protection",
    theme: "protection",
    category: "保護",
    title: "TVSだけで逆接も守れる？",
    problem:
      "24V入力機器でサージ対策のTVSを追加しました。顧客から電源の逆接対策も要求されています。妥当な提案は？",
    actions: [
      "TVSの過渡保護とは別に逆接経路と電流制限を検討する",
      "TVSがあれば逆接時の連続電流も必ず安全とする",
      "コンデンサを増やすだけで逆極性を正極性へ変える",
      "通常起動できたので逆接試験を省く",
    ],
    feedback: [
      "過渡抑制と継続した逆極性への対策は区別します。",
      "TVSの向きや電流経路によっては破損の危険があります。",
      "容量追加だけでは逆極性を解決できません。",
      "通常条件の試験は逆接条件の根拠ではありません。",
    ],
    check: "逆接時間、入力電流、ヒューズ協調、サージ波形、許容降下は？",
    products: ["TVS", "eFuse", "Ideal diode controller"],
    cases: ["virtual-power"],
    material: "block-41c575f83332",
  },
  {
    id: "plc",
    theme: "system",
    category: "システム設計",
    title: "PLCの不具合をブロックから探す",
    problem:
      "PLCで入力を検知できるのに負荷が動きません。部品を交換する前に顧客と確認する進め方は？",
    actions: [
      "入力・処理・出力・負荷電源・故障信号を順に追って切り分ける",
      "入力が読めたので電源と出力段は確認不要とする",
      "CPUを高速品へ替えることだけを提案する",
      "通信が動けば負荷の電源も正常と判断する",
    ],
    feedback: [
      "信号と電力と保護経路を分けて追うと故障位置を絞れます。",
      "入力側の正常は出力側の正常を保証しません。",
      "原因未特定のCPU交換では課題が残る可能性があります。",
      "通信系と負荷電源は異なる経路です。",
    ],
    check: "どこまで正常か、負荷条件、出力診断、電源、インターロックは？",
    products: ["Sitara", "Industrial digital output", "Power switch"],
    cases: ["virtual-plc"],
    material: "block-27ce108fa1a7",
  },
  {
    id: "battery",
    theme: "system",
    category: "無線",
    title: "電池寿命を待機電流だけで選ばない",
    problem:
      "電池駆動センサが周期的に起床して測定・無線送信します。待機電流が最小の部品に替えれば寿命が延びると提案する前に確認するのは？",
    actions: [
      "起床・測定・送信・待機の電力と時間を実運用周期で積算する",
      "待機電流が小さければ送信時間の比較を省く",
      "送信時の電流だけで全寿命を計算する",
      "電池の公称容量だけで温度やピーク負荷を無視する",
    ],
    feedback: [
      "運用全体のエネルギーと電池条件が寿命に影響します。",
      "起床や送信が支配的な場合もあります。",
      "各状態の継続時間と待機も必要です。",
      "使える容量や電圧降下は運用条件で変わります。",
    ],
    check: "送信周期、再送率、起動時間、温度、電池抵抗と必要寿命は？",
    products: ["SimpleLink", "Low-power MCU"],
    cases: ["virtual-sensor"],
    material: "digital-1-3",
  },
  {
    id: "incumbent",
    theme: "designwin",
    category: "競合比較",
    title: "切替を勧めない判断",
    problem:
      "既存の競合MCUで性能・供給・価格の要求を満たし、量産認定済みです。TIへの移行には再設計と再認証が必要で、現時点で改善要件はありません。妥当な初期提案は？",
    actions: [
      "現行継続も選択肢にし、移行の利益が費用・リスクを上回るか確認する",
      "TI製品であることだけを理由に直ちに置換する",
      "単価差だけで再設計と再認証を無視する",
      "同じコアならソフトと周辺回路を無検証で流用する",
    ],
    feedback: [
      "顧客価値が説明できなければ無理な切替を勧めません。",
      "メーカー名だけは技術・事業の採用理由になりません。",
      "移行には一時費用・工数・リスクがあります。",
      "コアが同じでも周辺機能やSDKは異なります。",
    ],
    check: "将来要求、供給課題、総BOM、開発工数、認証と回収期間は？",
    products: ["MSPM0", "C2000", "Sitara"],
    cases: [],
    material: "TI_Block_Diagram_Textbook_Phase1-7.md / Design Win",
  },
  {
    id: "evidence",
    theme: "designwin",
    category: "システム設計",
    title: "採用実績と採用理由を区別する",
    problem:
      "Excelには顧客と採用ICの対応が記載されていますが、採用理由や元の仕様はありません。新しい顧客への説明として適切なのは？",
    actions: [
      "資料上の採用記載と未確認の理由を分け、今回の要求への適合を別途確認する",
      "採用されたので今回も最適と断定する",
      "採用理由がないので低消費電力が理由だったと確定する",
      "製品紹介URLだけで顧客の採用動機まで証明できたとする",
    ],
    feedback: [
      "事例は候補発見の材料であり、理由や今回の成立の証明とは別です。",
      "顧客条件が異なれば適切な解も異なります。",
      "説明のない理由を事実として補ってはいけません。",
      "製品仕様と顧客の意思決定の証拠は異なります。",
    ],
    check: "元の要求・出典箇所・確認日・今回の制約について何が未確認か？",
    products: ["TI solution selection"],
    cases: [],
    material: "ti_ic_164_detailed_reference.xlsx / IC Master・IC 詳細解説",
  },
];

function choices(
  prompt: string,
  texts: string[],
  feedback: string[],
  offset: number,
): ChoiceTask {
  const options = texts.map((text, index) => ({
    id: `decision-${index}`,
    text,
    explanation: feedback[index],
  }));
  return {
    prompt,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    correctId: "decision-0",
  };
}

const wrongReasons: Record<string, [string, string, string]> = {
  secureboot: [
    "暗号化は発行元の署名検証を常に代替するから。",
    "ファイル名が一致すれば内容も正規だから。",
    "CRCから正規発行元を認証できるから。",
  ],
  sdk: [
    "SDK対応一覧が全ての外部デバイスの対応も保証するから。",
    "評価基板と独自基板の配線や電源は確認不要だから。",
    "CPUの速度だけでソフト移植の作業量が決まるから。",
  ],
  "on-time": [
    "入力耐圧と最小ON時間は同一の制約だから。",
    "周波数を上げれば同じ降圧比でもON時間が長くなるから。",
    "理想式から過渡応答と熱的成立も保証できるから。",
  ],
  capacitor: [
    "公称容量が同じなら実使用容量も必ず同じだから。",
    "耐圧定格内では誘電体の容量変化がないから。",
    "処理速度を上げれば出力容量不足は必ず解決するから。",
  ],
  node: [
    "MCUなら入力電圧を確認せずセンサへ直結できるから。",
    "OSなしでは周期処理を実行できないから。",
    "ADCだけで通信フレームも作成できるから。",
  ],
  deadline: [
    "公称クロックが高ければ割込み遅延は存在しないから。",
    "平均使用率が低ければ全周期で締切を守れるから。",
    "PWM周波数を上げるほど演算の時間予算も増えるから。",
  ],
  hmi: [
    "画面が滑らかなら制御周期も保証されるから。",
    "Linuxの起動確認は最悪遅延の検証と同じだから。",
    "画面負荷は制御処理へ影響しないから。",
  ],
  rs485: [
    "UART端子がRS-485と同じ電気特性を持つから。",
    "低速ならGND電位差を確認しなくてよいから。",
    "終端は台数分追加するほど必ず良くなるから。",
  ],
  can: [
    "CANコントローラが差動ドライバを必ず内蔵するから。",
    "CANとUARTはボーレート以外は同じだから。",
    "フレームの生成で物理層の成立も証明できるから。",
  ],
  i2c: [
    "プログラム内の名前を変えるとセンサの固定アドレスも変わるから。",
    "プルアップ抵抗がアドレスを割り当てるから。",
    "クロックを下げれば同じアドレスでも個別選択できるから。",
  ],
  buck: [
    "LDOの損失は入力電圧によらないから。",
    "昇圧専用方式でも入力より低い電圧へ必ず制御できるから。",
    "抵抗の出力電圧は負荷が変わっても一定だから。",
  ],
  ldo: [
    "定格電流以下なら周囲温度は関係ないから。",
    "出力電圧だけでLDOの損失が決まるから。",
    "同じ損失ならどのpackageでも同じ接合温度になるから。",
  ],
  adc: [
    "高分解能なら取得時間の制約がなくなるから。",
    "入力の整定はサンプリング周期と無関係だから。",
    "平均化すれば入力の充電不足も必ず消えるから。",
  ],
  shunt: [
    "電流が一定なら抵抗値を増やしても損失は一定だから。",
    "増幅ゲインを上げればシャント抵抗の発熱がなくなるから。",
    "測定電流から入力共通モード電圧も一意に決まるから。",
  ],
  io: [
    "ソフトで読取り値を制限すれば端子の電圧も下がるから。",
    "入力しきい値と過渡耐性は同じ仕様だから。",
    "信号が低速なら端子の絶対最大定格を超えてよいから。",
  ],
  isolation: [
    "信号が絶縁されていればGNDを直結しても直流導通しないから。",
    "伝送速度を下げると導線の直流導通がなくなるから。",
    "耐圧試験の電圧がそのまま連続使用できる動作電圧だから。",
  ],
  protection: [
    "サージ抑制部品は継続的な逆接電流も必ず安全に遮断するから。",
    "入力容量を増やせば電源の逆極性を正極性にできるから。",
    "通常起動の成功が逆接条件も検証するから。",
  ],
  plc: [
    "入力が読めれば出力電源も必ず正常だから。",
    "CPUの速度が全ての出力不具合の原因だから。",
    "通信応答は負荷電源の正常性を保証するから。",
  ],
  battery: [
    "待機電流が最小なら運用全体のエネルギーも最小だから。",
    "送信電流だけで状態ごとの継続時間を省略できるから。",
    "電池容量は温度やピーク負荷に影響されないから。",
  ],
  incumbent: [
    "メーカー名だけで移行費用を上回る価値を証明できるから。",
    "部品単価が安ければ総費用も必ず安くなるから。",
    "CPUコアが同じなら周辺回路もソフトも無検証で互換だから。",
  ],
  evidence: [
    "他社の採用実績は今回の仕様適合も証明するから。",
    "採用理由が空欄なら一般的な利点を事実として補ってよいから。",
    "製品紹介URLが顧客の意思決定の証拠になるから。",
  ],
};

function materialHash(material: string): string {
  if (material.startsWith("digital"))
    return "a6c9f80c71c1f28b75a5707a171f89509bcf9fdc12a079d23715da4a5ec04800";
  if (material.startsWith("analog"))
    return "f5dc23034b04683c66bc039d80dcad553dc5de0c716ae0ed29496f679863617f";
  if (material.startsWith("TI_Product"))
    return "7eb76d39786c4208a199f7ff6b958033e34b08e7a2ac828739846c21a7d7e2a6";
  if (material.startsWith("TI_Block_Diagram_Textbook"))
    return "0243b9016886cdbd5d22e499f0b8dd0cdf3624213adf79cddbb3664d638cbc0e";
  if (material.includes("xlsx"))
    return "3ef94f118aabfd40ddcce95ff7649ecebddb8e351e17856e4186860bfdf5e1fd";
  return "0b52e88492dec08d6908d7f9386aad4192d013df151012bc236ef155336c456b";
}

export const decisionQuestions: ShortQuestion[] = scenarios.flatMap(
  (scenario, index) =>
    ([1, 2, 3] as const).map((level) => ({
      id: `decision-${scenario.id}-lv${level}`,
      conceptId: `decision-${scenario.id}`,
      level,
      theme: scenario.theme,
      category: [scenario.category],
      title: scenario.title,
      selection: choices(
        scenario.problem,
        scenario.actions,
        scenario.feedback,
        index % 4,
      ),
      ...(level === 2
        ? {
            reason: choices(
              "この案件で、その判断を選ぶ根拠は？",
              [scenario.feedback[0], ...wrongReasons[scenario.id]],
              [scenario.feedback[0], ...scenario.feedback.slice(1)],
              (index + 1) % 4,
            ),
          }
        : {}),
      hints: [
        scenario.check,
        `候補構成：${scenario.actions[0]}`,
        ["decision-0", `decision-${1 + (index % 3)}`],
      ],
      basic: scenario.feedback[0],
      detailed: `${scenario.actions[0]}。${scenario.check} 個別型番の定格・性能・採用理由は別途根拠を確認し、未確認の適合は断定しません。`,
      customerChecks: [scenario.check],
      solutionCategory: scenario.products.join(" / "),
      relatedProducts: scenario.products,
      sources: [
        {
          url: "",
          section: `ローカルTI教材から判断課題へ再構成：${scenario.material}（元教材・採用理由の外部検証は未実施）`,
          checkedAt: "",
          scope: "reference",
          sha256: materialHash(scenario.material),
          localPath: scenario.material.includes("xlsx")
            ? "ti_ic_164_detailed_reference.xlsx"
            : scenario.material.startsWith("TI_Block_Diagram_Textbook")
              ? "ti_block_diagrams/TI_Block_Diagram_Textbook_Phase1-7.md"
              : scenario.material.startsWith("TI_Product_Quiz")
                ? "ti_block_diagrams/quizzes/TI_Product_Quiz.html"
                : "ti_block_diagrams/quizzes/" +
                  (scenario.material.startsWith("digital")
                    ? "TI_Digital_Seminar_Quiz.html"
                    : scenario.material.startsWith("analog")
                      ? "TI_Analog_Seminar_Quiz.html"
                      : "TI_Block_Diagram_Quiz.html"),
        },
        ...([
          "rs485",
          "isolation",
          "buck",
          "on-time",
          "secureboot",
          "adc",
        ].includes(scenario.id)
          ? [
              {
                url:
                  scenario.id === "rs485"
                    ? "https://www.ti.com/lit/an/slla272d/slla272d.pdf"
                    : scenario.id === "isolation"
                      ? "https://www.ti.com/document-viewer/lit/html/slla416"
                      : scenario.id === "secureboot"
                        ? "https://www.ti.com/document-viewer/lit/html/SWPB019E"
                        : scenario.id === "adc"
                          ? "https://www.ti.com/document-viewer/lit/html/SSZT980/GUID-F00D6831-7454-48EC-809B-0A76764360B1"
                          : "https://www.ti.com/lit/an/slva477b/slva477b.pdf",
                section:
                  scenario.id === "secureboot"
                    ? "Embedded security / Secure boot"
                    : scenario.id === "adc"
                      ? "ADC acquisition and settling"
                      : scenario.id === "rs485"
                        ? "RS-485 physical layer / termination"
                        : scenario.id === "isolation"
                          ? "Isolation boundary / power"
                          : "Basic buck power stage / CCM（数式は問題文の理想条件に限定）",
                checkedAt: "2026-10-19",
                scope: "concept" as const,
              },
            ]
          : []),
        ...scenario.products
          .filter((part) =>
            /^(MSPM0G3507|TMS320F280039C|AM625|THVD1450|TCAN1042H|TLV755P|INA240|ISO7741)$/.test(
              part,
            ),
          )
          .map((part) => ({
            url: `https://www.ti.com/lit/gpn/${part}`,
            section: `${part} datasheet / 関連候補（案件適合は未検証）`,
            checkedAt: "",
            scope: "concept" as const,
          })),
      ],
      advancedIds: scenario.cases,
    })),
);
