import type { Category } from "./model";
import type { ChoiceTask, ShortQuestion, Theme } from "./short-model";

type Concept = {
  id: string;
  theme: Theme;
  category: Category;
  title: string;
  prompt: string;
  options: [string, string, string, string];
  feedback: [string, string, string, string];
  reason: string;
  wrongReasons: [string, string, string];
  focus: string;
  family: string;
  detail: string;
  products: string[];
  source: string;
  section: string;
  advancedIds: string[];
};

const concepts: Concept[] = [
  {
    id: "mspm0",
    theme: "series",
    category: "MCU",
    title: "MSPM0は何をする？",
    prompt:
      "センサを読み、タイマやUARTを使う小さな制御基板。次のうち、汎用MCUのシリーズは？",
    options: ["MSPM0", "ISO77xx", "INA240", "TLV755P"],
    feedback: [
      "MSPM0は汎用MCUのシリーズです。",
      "ISO77xxはデジタル絶縁の製品群です。",
      "INA240は電流検出アンプです。",
      "TLV755PはLDOです。",
    ],
    reason: "MCUがプログラムを実行し、ADC・タイマ・通信などを制御するから。",
    wrongReasons: [
      "センサ入力の電圧が何Vでも直接接続できるから。",
      "MCUを使えば電源や保護回路が不要になるから。",
      "すべてのMSPM0の機能・ピン数が同じだから。",
    ],
    focus: "処理をする部品と、信号・電源を扱う周辺部品を分けます。",
    family: "TIの汎用MCUカテゴリに着目。",
    detail:
      "まず処理量・ADC・タイマ・通信・メモリを整理します。MSPM0という名前だけで、必要な機能や入力耐圧を保証できません。個別型番・packageと電源・前段・保護を確認します。",
    products: ["MSPM0", "MSPM0G3507"],
    source: "MSPM0G3507",
    section: "Device overview / peripherals",
    advancedIds: ["virtual-sensor"],
  },
  {
    id: "c2000",
    theme: "series",
    category: "リアルタイム制御",
    title: "PWMとADCを同期する",
    prompt:
      "次のTIシリーズのうち、モータやデジタル電源のリアルタイム制御を中心に展開しているのは？",
    options: ["C2000", "Sitara AM62x", "ISO77xx", "TLV755P"],
    feedback: [
      "C2000はリアルタイム制御向けのMCUシリーズです。",
      "AM62xはLinux HMIなどの用途を持つプロセッサです。",
      "ISO77xxは信号の絶縁を扱います。",
      "TLV755Pは電源用LDOです。",
    ],
    reason: "PWM・ADC・演算・保護を時間のつながりとして設計する用途だから。",
    wrongReasons: [
      "C2000なら制御周期を測定せず保証できるから。",
      "周波数が高いほど必ず全制御が成立するから。",
      "制御MCUには電流検出回路が一切不要だから。",
    ],
    focus: "平均的な速さより、入力から出力までの締切に着目。",
    family: "リアルタイム制御MCUのシリーズを探します。",
    detail:
      "C2000という分類を覚える問題で、他のMCUが制御できないという意味ではありません。実際はADCの取得・変換、制御演算、PWM更新、保護の時間予算を確認します。",
    products: ["C2000", "TMS320F280039C"],
    source: "TMS320F280039C",
    section: "Real-time control / ePWM / ADC",
    advancedIds: ["virtual-servo"],
  },
  {
    id: "sitara",
    theme: "series",
    category: "Processor",
    title: "Linux画面付き操作盤",
    prompt: "次のうち、Linuxを使うHMIの処理を検討できるTIのプロセッサは？",
    options: ["Sitara AM625", "INA240", "ISO7741", "THVD1450"],
    feedback: [
      "AM625はHMIなどを検討するプロセッサ候補です。",
      "INA240は電流検出アンプです。",
      "ISO7741はデジタルアイソレータです。",
      "THVD1450はRS-485トランシーバです。",
    ],
    reason: "OS・表示・アプリケーションを実行する処理系が必要だから。",
    wrongReasons: [
      "Linuxならすべての制御の最悪応答時間が保証されるから。",
      "プロセッサ単体でDDRや電源設計が不要になるから。",
      "画面の解像度を確認しなくてよいから。",
    ],
    focus: "画面やOSを動かす処理と、センサ前段を区別。",
    family: "Sitaraのアプリケーションプロセッサに着目。",
    detail:
      "表示I/F、メモリ、ストレージ、電源、起動時間、保守を確認します。厳密なリアルタイム制御は別途評価し、Linuxの起動成功だけをシステム成立の証拠にしません。",
    products: ["Sitara", "AM625"],
    source: "AM625",
    section: "Applications / HMI / software",
    advancedIds: ["virtual-hmi"],
  },
  {
    id: "rs485",
    theme: "communication",
    category: "産業通信",
    title: "UARTとRS-485の違い",
    prompt: "MCUのUART信号をRS-485の差動バスへ接続する際に必要な機能は？",
    options: ["RS-485トランシーバ", "ADC", "LDO", "電流検出アンプ"],
    feedback: [
      "トランシーバが送受信の電気的な接続を担います。",
      "ADCはアナログ信号を数値化します。",
      "LDOは電源電圧を調整します。",
      "電流検出アンプは計測の前段です。",
    ],
    reason: "UARTの論理信号と、RS-485バスの電気的な信号は別だから。",
    wrongReasons: [
      "UART端子をバスへ直結すれば同じ電気特性だから。",
      "RS-485だけで通信データの意味まで全て定義されるから。",
      "トランシーバを付ければ終端や配線条件の確認が不要だから。",
    ],
    focus: "データの送受信機能と、基板外の電気的な接続を分けます。",
    family: "InterfaceのRS-485トランシーバを探します。",
    detail:
      "THVD1450は関連候補の一例です。半二重/全二重、方向制御、終端、バイアス、GND電位差、保護・絶縁を別々に確認します。UARTとRS-485は同義語ではありません。",
    products: ["THVD1450"],
    source: "THVD1450",
    section: "RS-485 transceiver / description",
    advancedIds: ["virtual-ethernet", "virtual-sensor"],
  },
  {
    id: "i2c",
    theme: "communication",
    category: "MCU",
    title: "SDAとSCLの通信",
    prompt: "SDA（データ）とSCL（クロック）の2信号を基本に使う通信は？",
    options: ["I2C", "UART", "SPI", "CAN"],
    feedback: [
      "SDAとSCLはI2Cの信号名です。",
      "UARTはTX/RXなどを使う非同期通信です。",
      "SPIはSCLKやデータ・選択信号などを使います。",
      "CANはCANコントローラと物理層を含めて構成します。",
    ],
    reason: "I2Cではデータ用SDAとクロック用SCLを使うから。",
    wrongReasons: [
      "2信号なら電圧・容量・抵抗の確認が不要だから。",
      "I2CはUARTと同じ端子名だから。",
      "すべての機器をアドレス重複のまま接続できるから。",
    ],
    focus: "信号名の組み合わせを手掛かりにします。",
    family: "MCUのシリアル通信I/Fを見分けます。",
    detail:
      "まず通信方式と信号名を区別します。実回路ではプルアップ、電圧、アドレス、バス容量、速度を確認します。SPI/UART/CANとの優劣は用途と条件で変わります。",
    products: ["MSPM0G3507"],
    source: "MSPM0G3507",
    section: "Enhanced communication interfaces / I2C",
    advancedIds: ["virtual-sensor"],
  },
  {
    id: "uart",
    theme: "communication",
    category: "MCU",
    title: "TXとRXでデバッグログを送る",
    prompt:
      "共有するクロック信号を使わず、TX/RXとボーレート設定でシリアル通信する機能は？",
    options: ["UART", "SPI", "I2C", "ADC"],
    feedback: [
      "UARTは非同期のシリアル通信に使います。",
      "SPIはクロックに同期する方式です。",
      "I2CはSCLというクロック信号を使います。",
      "ADCはアナログ信号を数値へ変換します。",
    ],
    reason:
      "送受信側のボーレートなどを合わせ、共有クロック信号なしでデータを送るため。",
    wrongReasons: [
      "TX/RXの電圧レベルは常に何でも接続できるから。",
      "ボーレートやparityは不一致でもよいから。",
      "UART端子がそのままRS-485やRS-232の電気特性を持つから。",
    ],
    focus: "クロック信号の有無と、端子の役割に着目。",
    family: "MCUのUARTなどのシリアル通信機能です。",
    detail:
      "デバッグログではTX/RX、GND、ボーレート、parity、stop bit、pinmuxを確認します。UARTは論理的な送受信の機能で、接続先との電圧レベルやRS-485/RS-232の物理層は別確認です。",
    products: ["MSPM0G3507"],
    source: "MSPM0G3507",
    section: "Enhanced communication interfaces / UART",
    advancedIds: ["virtual-sensor"],
  },
  {
    id: "spi",
    theme: "communication",
    category: "MCU",
    title: "クロックとCSで周辺ICを選ぶ",
    prompt: "SCLKとCS（chip select）などを使って周辺ICと同期通信する方式は？",
    options: ["SPI", "UART", "I2C", "CAN"],
    feedback: [
      "SPIではクロックやchip selectなどを使います。",
      "UARTは共有クロックを使わない非同期通信です。",
      "I2Cの基本信号はSDA/SCLで、通常はアドレスで相手を指定します。",
      "CANではSPIのCSでバス上の機器を指定しません。",
    ],
    reason:
      "クロックに同期してデータを送り、CSなどで通信対象を選ぶ方式だから。",
    wrongReasons: [
      "クロックの極性・位相を相手と合わせなくてよいから。",
      "通信速度が高いほど配線・遅延の確認が不要だから。",
      "SPIには電圧レベルやタイミング条件が存在しないから。",
    ],
    focus: "SCLKとCSという信号名の組み合わせに着目。",
    family: "MCUのSPIインターフェースを確認します。",
    detail:
      "SPIを接続する際は信号方向、CS、clock polarity/phase、速度、電圧、タイミングを確認します。絶縁を挟む場合は追加の伝搬遅延も必要です。すべての機器が同じSPI設定で動くわけではありません。",
    products: ["MSPM0G3507", "ISO7741"],
    source: "MSPM0G3507",
    section: "Enhanced communication interfaces / SPI",
    advancedIds: ["virtual-isolation", "virtual-sensor"],
  },
  {
    id: "can",
    theme: "communication",
    category: "産業通信",
    title: "CANコントローラと物理層",
    prompt:
      "MCUのCANコントローラをCANH/CANLの差動バスへ接続するための部品カテゴリは？",
    options: ["CANトランシーバ", "RS-485トランシーバ", "ADC", "LDO"],
    feedback: [
      "CANトランシーバがCANバスへの電気的な接続を担います。",
      "RS-485とCANは同じ物理層ではなく、単に差動だから置き換えられるわけではありません。",
      "ADCは通信バスの物理層ではありません。",
      "LDOは電源レールを調整します。",
    ],
    reason: "CANコントローラの論理信号と、CANバスの電気信号を接続するため。",
    wrongReasons: [
      "MCUにCAN機能があればCANH/CANLへ常に直結できるから。",
      "差動通信ならRS-485部品も全て互換だから。",
      "CAN対応ならCAN FDの必要速度も型番確認なしで保証できるから。",
    ],
    focus: "プロトコルを処理する機能と、バスを駆動する部品を分けます。",
    family: "InterfaceのCAN transceiverです。",
    detail:
      "TCAN1042Hは関連部品の一例です。CAN/CAN FD、必要速度、電源、論理レベル、終端、保護、絶縁と配線を確認します。この問題はカテゴリ識別で、特定構成の通信成立を保証しません。",
    products: ["TCAN1042H", "MSPM0G3507"],
    source: "TCAN1042H",
    section: "CAN transceiver / description",
    advancedIds: ["virtual-servo", "virtual-ethernet"],
  },
  {
    id: "ldo",
    theme: "power",
    category: "電源",
    title: "LDOはどの役割？",
    prompt:
      "TLV755Pのように、入力から低い電圧を作るリニアレギュレータのカテゴリは？",
    options: ["LDO", "RS-485トランシーバ", "ADC", "デジタルアイソレータ"],
    feedback: [
      "LDOはリニアレギュレータのカテゴリです。",
      "トランシーバは通信の電気的な接続を担います。",
      "ADCはアナログからデジタルへ変換します。",
      "アイソレータは信号の絶縁を扱います。",
    ],
    reason:
      "出力電圧を調整する電源部品で、電圧差による損失を確認する必要があるから。",
    wrongReasons: [
      "入力と出力の電圧差が大きいほど発熱が必ず小さくなるから。",
      "LDOの入力電圧に上限がないから。",
      "出力電圧だけ合えば電流・熱・コンデンサ条件は無関係だから。",
    ],
    focus: "信号ではなく、電力の経路を扱う部品です。",
    family: "Power managementのリニアレギュレータを選びます。",
    detail:
      "入力範囲、出力電流、dropout、熱、必要なコンデンサを確認します。24V系だからといってTLV755Pへ直接接続してよいとは言えません。この問題はカテゴリ識別で、24V適合の判定ではありません。",
    products: ["TLV755P"],
    source: "TLV755P",
    section: "Low-dropout regulator / description",
    advancedIds: ["virtual-power"],
  },
  {
    id: "power-tree",
    theme: "power",
    category: "電源",
    title: "24Vから低電圧レールへ",
    prompt:
      "装置の24V系からMCU用の低い電圧レールをスイッチング方式で作りたい。機能カテゴリは？",
    options: [
      "降圧DC/DC（Buck）",
      "昇圧DC/DC（Boostのみ）",
      "ADC",
      "RS-485トランシーバ",
    ],
    feedback: [
      "Buckは降圧の方式です。",
      "Boostのみの方式は昇圧です。",
      "ADCは信号の変換です。",
      "トランシーバは通信部品です。",
    ],
    reason: "入力より低い電圧へ電力変換するための方式だから。",
    wrongReasons: [
      "24Vという公称値だけで過渡入力も全て保証できるから。",
      "降圧電源なら逆接・絶縁も必ず内蔵しているから。",
      "定格確認やEMI評価が不要になるから。",
    ],
    focus: "入力より出力が低い、という関係に着目。",
    family: "降圧スイッチング電源のカテゴリです。",
    detail:
      "ここで選ぶのは方式です。個別ICが実装条件に適合するかは別判定です。入力変動・サージ、電流、効率、熱、レイアウト、EMIと保護を確認します。",
    products: ["降圧DC/DC"],
    source:
      "https://www.ti.com/product-category/power-management/dc-dc-switching-regulators/overview.html",
    section: "Step-down (buck) converters",
    advancedIds: ["virtual-power"],
  },
  {
    id: "adc",
    theme: "sensing",
    category: "アナログ",
    title: "センサ電圧を数値にする",
    prompt: "温度センサのアナログ電圧を、MCUで扱う数値へ変換する機能は？",
    options: ["ADC", "DAC", "PWM出力", "LDO"],
    feedback: [
      "ADCはアナログ信号をデジタル値へ変換します。",
      "DACは逆にデジタル値からアナログを作ります。",
      "PWMはパルスの出力です。",
      "LDOは電源の調整です。",
    ],
    reason: "ADCが連続的な入力信号をデジタル値として取得するから。",
    wrongReasons: [
      "ADCのbit数だけでセンサシステムの精度が決まるから。",
      "ADC端子は産業用電圧を何Vでも入力できるから。",
      "基準電圧やノイズは測定値に影響しないから。",
    ],
    focus: "変換する方向は、アナログ → デジタルです。",
    family: "Data converterまたはMCU内蔵ADCに着目。",
    detail:
      "ADCの分解能とシステム精度は別です。センサ、基準電圧、前段回路、取得時間、ノイズ、校正も確認します。入力範囲外の信号には適切な前段と保護が必要です。",
    products: ["MSPM0G3507"],
    source: "MSPM0G3507",
    section: "Analog peripherals / ADC",
    advancedIds: ["virtual-sensor"],
  },
  {
    id: "current",
    theme: "sensing",
    category: "アナログ",
    title: "シャントの小さな電圧を読む",
    prompt:
      "シャント抵抗の両端の小さな差電圧を増幅して電流測定につなぐ部品は？",
    options: [
      "電流検出アンプ",
      "RS-485トランシーバ",
      "LDO",
      "デジタルアイソレータ",
    ],
    feedback: [
      "電流検出アンプが小さな差電圧を扱います。",
      "RS-485は通信の物理層です。",
      "LDOは電源部品です。",
      "デジタルアイソレータはデジタル信号の絶縁を扱います。",
    ],
    reason: "シャント電圧を計測に適した信号にし、後段のADCへ渡すため。",
    wrongReasons: [
      "シャント抵抗の発熱を無視してよいから。",
      "アンプさえ選べばコモンモード範囲は無関係だから。",
      "PWM過渡と計測帯域は確認しなくてよいから。",
    ],
    focus: "計測対象は通信データではなく、小さな差電圧です。",
    family: "Analogのcurrent-sense amplifierです。",
    detail:
      "INA240は関連部品の一例です。シャント抵抗、コモンモード、利得、offset、帯域、PWM過渡とADCを含めて精度を考えます。車載用途の認定は正確な型番で別途確認します。",
    products: ["INA240"],
    source: "INA240",
    section: "Current-sense amplifier / description",
    advancedIds: ["virtual-current", "virtual-servo"],
  },
  {
    id: "isolation",
    theme: "protection",
    category: "絶縁",
    title: "信号を絶縁して渡す",
    prompt:
      "異なる電位の回路間で、直流の導通を分離しながらデジタル信号を渡す機能は？",
    options: ["デジタルアイソレータ", "LDO", "ADC", "通常の非絶縁UART端子"],
    feedback: [
      "デジタルアイソレータは絶縁境界をまたいで信号を伝えます。",
      "LDOだけでは信号の絶縁になりません。",
      "ADCという機能だけでは絶縁を意味しません。",
      "通常のUART端子だけでは絶縁になりません。",
    ],
    reason: "デジタル信号の伝達と電気的な絶縁を両立する役割だから。",
    wrongReasons: [
      "信号を絶縁すれば電源も必ず絶縁されるから。",
      "絶縁部品を付ければ基板の沿面距離は無関係だから。",
      "絶縁ならすべてのノイズ源を調べなくてよいから。",
    ],
    focus: "信号を通すことと、GNDを直結することを分けます。",
    family: "Isolationのdigital isolatorです。",
    detail:
      "ISO7741は関連部品の一例です。チャネル方向、遅延、CMTI、使用電圧、絶縁電源、基板上の距離と規格を確認します。信号だけ絶縁しても、装置全体の安全性は保証されません。",
    products: ["ISO7741"],
    source: "ISO7741",
    section: "Digital isolator / description",
    advancedIds: ["virtual-isolation"],
  },
  {
    id: "noise",
    theme: "protection",
    category: "保護",
    title: "通信ノイズの最初の一歩",
    prompt:
      "モータの動作時だけRS-485通信が乱れる。最初の確認として適切なのは？",
    options: [
      "配線・終端・GND電位差と波形を、動作条件を揃えて確認する",
      "根拠なくMCUを高速品へ変える",
      "全てソフトの問題と断定する",
      "通信速度だけ上げれば必ず直ると説明する",
    ],
    feedback: [
      "条件と波形を揃えると原因を切り分けられます。",
      "MCUの速さが原因とはまだ分かりません。",
      "物理層・電源・ノイズの可能性も残ります。",
      "速度を上げれば解決するとは言えません。",
    ],
    reason: "原因を決めつけず、電気的条件と再現する証拠を集めるため。",
    wrongReasons: [
      "波形がなくても型番だけで原因を確定できるから。",
      "RS-485なら配線条件は無関係だから。",
      "終端抵抗を増やせば常に改善するから。",
    ],
    focus: "変更の前に、発生する条件と信号を観測します。",
    family: "Interface・保護・絶縁を横断して確認します。",
    detail:
      "改善策は観測してから選びます。THVD1450のようなトランシーバでも、配線・終端・電位差・電源・EMC条件は別評価です。絶縁や部品置換を無条件の正解にはしません。",
    products: ["THVD1450"],
    source: "THVD1450",
    section: "Application / RS-485 interface",
    advancedIds: ["virtual-isolation", "virtual-ethernet"],
  },
  {
    id: "motor",
    theme: "system",
    category: "リアルタイム制御",
    title: "モータ制御の信号の流れ",
    prompt: "電流フィードバックを使う制御の基本的な流れは？",
    options: [
      "電流検出 → ADC → 制御演算 → PWM",
      "PWM → LDO → UARTだけ",
      "ADC → 電源入力へ直結",
      "通信速度だけを上げる",
    ],
    feedback: [
      "測定した値を演算し、出力へ反映します。",
      "計測とフィードバックの経路が抜けています。",
      "ADCは電源を直接駆動する部品ではありません。",
      "通信速度だけでは閉ループ制御を構成できません。",
    ],
    reason: "測った電流を使って次の出力を調整する閉ループだから。",
    wrongReasons: [
      "ブロックを並べれば遅延は自動的にゼロになるから。",
      "ADCの取得時刻はPWMと無関係だから。",
      "異常時の保護は不要だから。",
    ],
    focus: "入力を測定し、計算した結果を出力へ戻します。",
    family: "C2000などのリアルタイム制御系と電流検出を結びます。",
    detail:
      "この順序は機能の説明です。実際の成立にはサンプリング、最悪演算時間、PWM更新時刻、保護の経路、ゲートドライバや電力段を含む検証が必要です。",
    products: ["C2000", "TMS320F280039C", "INA240"],
    source: "TMS320F280039C",
    section: "ADC / PWM / real-time control",
    advancedIds: ["virtual-servo"],
  },
  {
    id: "plc-node",
    theme: "system",
    category: "システム設計",
    title: "産業センサノードの境界",
    prompt: "24V系のデジタル入力を低電圧MCUで読む前に必要な考え方は？",
    options: [
      "入力条件を確認し、レベル変換・保護・必要な絶縁を設計する",
      "24VをGPIOへそのまま接続する",
      "UARTの設定だけで電圧を変換する",
      "MCUのソフトだけで入力定格を広げる",
    ],
    feedback: [
      "外部信号とMCUの境界に適切な回路が必要です。",
      "端子の定格違反や破損につながり得ます。",
      "UART設定は電圧変換の代わりになりません。",
      "ソフトは端子の電気定格を変更できません。",
    ],
    reason: "外部の産業信号とMCU端子の動作条件は異なるため。",
    wrongReasons: [
      "公称24Vなら過渡電圧は存在しないから。",
      "GPIOのON/OFF入力には電気定格がないから。",
      "絶縁・保護・変換はすべて同じ機能だから。",
    ],
    focus: "入力がデジタルでも、電圧と過渡条件の確認は必要。",
    family: "MCUとInterface・保護の境界を考えます。",
    detail:
      "PLC/センサノードでは入力閾値、電流、過渡、逆接、GND、絶縁の要否を整理します。MCUの品番だけを決めても入力回路は完成しません。安全性や規格適合はこの問題では判定しません。",
    products: ["MSPM0G3507"],
    source: "MSPM0G3507",
    section: "Operating characteristics / I/O",
    advancedIds: ["virtual-sensor", "virtual-power"],
  },
  {
    id: "incumbent",
    theme: "designwin",
    category: "競合比較",
    title: "TIに替えない選択",
    prompt:
      "現行品は要求を満たし、TIへの切替効果より移行・再評価費が大きい。合理的な判断は？",
    options: [
      "現行維持も提案し、必要なら周辺部品の改善を比較する",
      "必ずTIへ全て置換する",
      "競合は性能が低いと根拠なく説明する",
      "移行費は比較から除外する",
    ],
    feedback: [
      "顧客の価値を優先し、維持も比較対象にします。",
      "置換そのものが顧客の目的ではありません。",
      "比較には同条件の根拠が必要です。",
      "移行・再評価費は導入判断に影響します。",
    ],
    reason:
      "部品単価だけでなく総コスト・リスクと顧客の採用条件を比較するため。",
    wrongReasons: [
      "TIという社名だけで技術適合が証明できるから。",
      "現行ソフトを無視する方が公平だから。",
      "開発リスクはBOM単価に常に含まれているから。",
    ],
    focus: "顧客の便益が切替コストを上回るかを考えます。",
    family: "型番の優劣ではなく、構成・移行・供給を比較。",
    detail:
      "これは仮定した顧客条件に対する判断問題で、特定メーカーの実際の優劣ではありません。性能、BOM、移行工数、認証、納期、保守を同じ前提で比較します。",
    products: ["TI製品カテゴリ横断"],
    source: "",
    section: "架空の判断演習 / 競合比較の学習方針",
    advancedIds: [
      "competition-STM32",
      "competition-Renesas",
      "competition-ADI",
      "competition-NXP",
      "competition-Infineon",
    ],
  },
  {
    id: "evidence",
    theme: "designwin",
    category: "競合比較",
    title: "採用確認と採用理由",
    prompt:
      "Notionに『TI部品の搭載』だけが記載され、理由の根拠がない。正しい扱いは？",
    options: [
      "搭載の記載と理由の仮説を分け、理由は未確認にする",
      "搭載されているので最安が理由と断定する",
      "TI採用なら性能が競合より必ず高いとする",
      "推定理由を公式回答として暗記する",
    ],
    feedback: [
      "搭載の記載と選定理由の証拠は別です。",
      "搭載の記載だけでは価格理由は分かりません。",
      "採用だけで競合との性能差は分かりません。",
      "推定を事実に昇格させてはいけません。",
    ],
    reason: "確認できた記載と、外部未検証の理由・仮説を混同しないため。",
    wrongReasons: [
      "DBに書けば推定が公式情報に変わるから。",
      "採用事実から全ての非公開仕様を復元できるから。",
      "競合比較の根拠はなくてもよいから。",
    ],
    focus: "何が書いてあるかと、なぜ選ばれたかを分けます。",
    family: "製品カテゴリより、証拠の確度を確認。",
    detail:
      "元記載の確認は、外部原典の検証済みという意味でもありません。URL、該当箇所、確認日を残し、採用・性能・選定理由を別々に検証します。非公開理由は正解として補完しません。",
    products: ["TI製品カテゴリ横断"],
    source: "",
    section: "Notion根拠分類 / アプリの学習方針",
    advancedIds: ["virtual-sensor"],
  },
];

function task(
  prompt: string,
  texts: string[],
  feedback: string[],
  offset: number,
): ChoiceTask {
  const options = texts.map((text, index) => ({
    id: `option-${index}`,
    text,
    explanation: feedback[index],
  }));
  return {
    prompt,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    correctId: "option-0",
  };
}

const datasheetRevisions: Record<string, string> = {
  MSPM0G3507: "SLASEX6C / Rev. C",
  TMS320F280039C: "Rev. C",
  AM625: "Rev. C",
  THVD1450: "Rev. E",
  TLV755P: "Rev. D",
  INA240: "Rev. C",
  ISO7741: "Rev. K",
  TCAN1042H: "Rev. D",
};

export const shortQuestions: ShortQuestion[] = concepts.flatMap(
  (concept, index) =>
    ([1, 2, 3] as const).map((level) => ({
      id: `short-${concept.id}-lv${level}`,
      conceptId: concept.id,
      level,
      theme: concept.theme,
      category: [concept.category],
      title: concept.title,
      selection: task(
        concept.prompt,
        concept.options,
        concept.feedback,
        index % 4,
      ),
      ...(level === 2
        ? {
            reason: task(
              "選んだ理由として適切なのは？",
              [concept.reason, ...concept.wrongReasons],
              [
                concept.reason,
                ...concept.wrongReasons.map(
                  () =>
                    "この説明は条件や根拠を無視しています。詳細解説で確認しましょう。",
                ),
              ],
              (index + 2) % 4,
            ),
          }
        : {}),
      hints: [
        concept.focus,
        concept.family,
        ["option-0", `option-${1 + (index % 3)}`],
      ],
      basic: concept.feedback[0] + " " + concept.reason,
      detailed: concept.detail,
      relatedProducts: concept.products,
      sources: [
        {
          url: concept.source
            ? concept.source.startsWith("https:")
              ? concept.source
              : `https://www.ti.com/product/${concept.source}`
            : "",
          section: concept.section,
          checkedAt: concept.source ? "2026-10-19" : "",
          scope: "concept",
          ...(datasheetRevisions[concept.source]
            ? {
                datasheet: {
                  partNumber: concept.source,
                  url: `https://www.ti.com/lit/gpn/${concept.source}`,
                  revision: datasheetRevisions[concept.source],
                  section: `Features / Description / ${concept.section}`,
                },
              }
            : {}),
          localPath: concept.source
            ? "TI_job/14_industrial_product_application_first_curriculum.md"
            : "fae-design-win-simulator/README.md",
        },
      ],
      advancedIds: concept.advancedIds,
    })),
);
