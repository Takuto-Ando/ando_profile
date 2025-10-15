---
permalink: /about/
title: "研究内容"
lang: 'ja'
classes: wide
---
## 現在の研究

### IMAXを用いたAIアプリケーションの実装と評価
現在は、奈良先端大 コンピューティング・アーキテクチャ研究室で開発された、CGRAベースのハードウェアアクセラレータであるIMAX (In-Memory Accelerator eXtension)に関わる研究をしています。
IMAXの基本設計は、演算ユニットとキャッシュメモリを交互に配置する線形アレイ構造にあり、CGRAの柔軟性とシストリックアレイの効率性・高速コンパイルを融合しています。
さらにニアメモリコンピューティングの設計を取り入れた次世代の汎用デジタルアクセラレータです。
これにより高いスループットに加えて、エネルギー効率を維持することができます。

私はエッジ指向のIMAX3とサーバ指向のIMAX4のLLMやAIアプリケーション実装や評価、メモリアクセスの最適化をすることで、IMAXプロジェクトに貢献しています。
修士課程では、世の中の人にIMAXの存在を知ってもらうために、論文投稿や学会発表をたくさん行うつもりです(査読付き国際会議4本採択 : 2025/04~10現在)。

**私が実装したアプリケーションの例**

* Stable-Diffusionのよる画像生成のIMAX実装(MCSoC 2025 採択)
* Qwen3やLlama3といったモダンなLLMのIMAX実装(SOCC 2025, SASIMI 2025 採択
* Whisper モデルによる音声認識のIMAX実装およびFP16カーネルの評価(CANDAR 2025 採択)
* エッジAIアプリケーション(査読中のため公開なし)

IMAXの演算カーネルはC言語でプログラム可能であり、アプリケーションの実装もC言語を用いることが望まれます。
実環境で利用可能な汎用アプリケーションの実装は、メモリの使い方を工夫しないと使い物にならないことを実感しています。

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax.jpg" alt="image-center" style="display: block; margin: 0 auto; width: 700px;">

imax4(左)とimax3(右) (掲載許可済み)

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax4_proto.jpg" alt="image-center" style="display: block; margin: 0 auto; width: 700px;">

VPK120x1とVPK180x4で構成されたIMAX4のプロトタイプ (掲載許可済み)

## 高専での研究
### AI推論処理のハードウェア実装

人間の表情を画像解析によって推定するシステムをハードウェア化し、消費電力の少ない効率的な処理方法について研究していました。 具体的には、FPGA(Field Programmable Gate Array)上のDNN (AI) アクセラレータを効果的に利用した表情認識システムを実装しました。TransformerをはじめとするSOTAな演算のハードウェア実装に興味があります。

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/fpga_system_fig.png" alt="image-center" style="display: block; margin: 0 auto; width: 500px;">


<div style="
  position: relative;
  display:block;
  margin:0 auto;
  width: 100%;
  max-width:780px;
  max-height: 585px;
  padding-bottom: 75%;
  top: 50%;"
>
  <iframe 
    src="https://speakerdeck.com/player/31712b81ffbe4805832711d6c3b4f209" title="DPUを用いたマルチタスクDNN表情認識システムのFPGA実装" 
    style="
      position: absolute;
      top: 0;
      left: 0%;
      width: 100%;
      height: 100%;
      max-width:780px;
      max-height: 585px;
      border: 0;
    "
  >
  </iframe>
</div>

<br>


###  物体検出アルゴリズムの実応用

高専５年次の卒業研究では、画像解析技術に関する研究に取り組み、効率的な小ねぎ調製のための小ねぎ分岐部検出アルゴリズムを開発しました。さらに、特に農工連携関係でYOLOやMask-RCNNといった深層学習モデルによる物体検出やセグメンテーションの実応用に取り組んでいます。


<div style="
  position: relative;
  display:block;
  margin:0 auto;
  width: 100%;
  max-width:780px;
  max-height: 585px;
  padding-bottom: 75%;
  top: 50%;"
>
  <iframe 
    src="https://speakerdeck.com/player/f027bc23215946868b187e68bec91c37" title="小ねぎ調製位置検出のためのインスタンスセグメンテーション" 
    style="
      position: absolute;
      top: 0;
      left: 0%;
      width: 100%;
      height: 100%;
      max-width:780px;
      max-height: 585px;
      border: 0;
    "
  >
  </iframe>
</div>
