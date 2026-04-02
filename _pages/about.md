---
permalink: /about/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Research

My research focuses on implementing and optimizing state-of-the-art AI workloads on **IMAX** (In-Memory Accelerator eXtension), a non-von Neumann CGLA (Coarse-Grained Logic Array) developed at NAIST's Computing Architecture Lab.

I am particularly interested in the gap between kernel-level acceleration and actual end-to-end system performance. In practice, accelerator efficiency is often limited not only by compute kernels but also by host overhead, DMA behavior, memory constraints, and runtime policy. My work therefore combines architecture study, software implementation, and system evaluation.

**Research Keywords**

Computer Architecture · Domain-Specific Architecture · AI Accelerator · Non-von Neumann  
Hardware/Software Co-design · Near-Memory Computing · Low-Power Computing  
LLM · Generative AI · Image Generation · Speech Recognition · Deep Learning · Edge AI

### Research Perspective

- Build practical AI systems rather than isolated kernels
- Quantify bottlenecks with runtime breakdowns and cross-platform comparison
- Reuse implementation knowledge across multiple AI domains
- Connect edge-oriented prototypes to server-scale evaluation

---

### Current Research at NAIST

The explosive growth in LLMs and generative AI has driven massive demand for GPU compute. However, GPUs are fundamentally not architected for energy efficiency — they rely on enormous memory bandwidth rather than intrinsic efficiency. This is not a sustainable foundation for AI's continued evolution.

I believe the most impactful next step is the widespread adoption of **non-von Neumann computing** that structurally eliminates the von Neumann bottleneck. My research aims to realize this through hardware/software co-design combining near-memory and in-memory computing paradigms.

#### LLM Acceleration on IMAX3/IMAX4

Running Llama3, Qwen, and Flan-T5 on IMAX. Detailed bottleneck analysis revealed host CPU and PCIe bandwidth limitations. Based on this, I designed and evaluated IMAX4 with a high-performance server CPU and PCIe Gen5, demonstrating server-scale AI workload scalability.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.25rem 0;">
  <img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax3andimax4.jpg" alt="IMAX3 and IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax4_proto.jpg" alt="IMAX4 Prototype" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

**Publications:** IEEE Access (2025), SOCC 2025, SASIMI 2025 [Young Researcher Award], ICISN 2026 [Best Paper]

**Highlights:** 44.4x PDP improvement vs RTX 4090 in projected 28nm evaluation, 1.62x prefill speedup with Q-Snap, and large host-side overhead reduction through IMAX4 migration.

#### Generative AI — Stable Diffusion on IMAX

Implemented Stable Diffusion on IMAX, demonstrating that the CGLA architecture handles diverse generative AI workloads beyond text generation.

**Publication:** MCSoC 2025

**Focus:** understanding how far LLM-oriented quantized kernels can be reused for image generation workloads and where FP16/FP32 support becomes the limiting factor.

#### Speech Recognition — Whisper on IMAX

Ported Whisper ASR to IMAX with a custom FP16 computational kernel. Achieved energy-efficient inference and demonstrated architectural versatility of CGLA.

**Publication:** CANDAR 2025 [Best Paper]

**Focus:** mixed execution between host CPU and IMAX, custom FP16 kernel design, and energy-efficiency evaluation across model and quantization settings.

---

### Past Research — College of Technology

#### Object Detection — Green Onion Branching Point Detection

Developed a branching-point detection algorithm for automated green onion trimming on edge devices. Combined classical edge detection with YOLO/Mask-RCNN deep learning for accuracy and lightweight execution on resource-constrained devices.

#### AI Inference on FPGA — Facial Expression Recognition

Implemented real-time facial expression recognition on FPGA using a DPU-based DNN accelerator with time-division multi-tasking of two DNN models on a single hardware unit. Demonstrated superior frame rate and power efficiency versus embedded CPU.

<div markdown="0" style="margin:1.25rem 0;">
  <img src="{{ site.url }}{{ site.baseurl }}/assets/images/fpga_system_fig.png" alt="FPGA System" style="max-width:480px;width:100%;border:1px solid #E2E8F0;">
</div>

### Current Interest

In the near term, I am especially interested in unified software stacks for heterogeneous AI workloads, efficient execution of emerging models such as SSMs and LLM variants, and system-level methods that make accelerator research more reproducible and comparable.

{% else %}

## 研究内容

私の研究は、NAIST コンピューティング・アーキテクチャ研究室で開発された非ノイマン型 CGLA（粗粒度再構成可能論理アレイ）**IMAX** 上での AI ワークロードの実装・最適化に焦点を当てています。

特に関心があるのは、カーネル単体の高速化と実際の end-to-end 性能の間にあるギャップです。実際のアクセラレータ効率は、演算カーネルだけでなく、ホスト側オーバーヘッド、DMA の振る舞い、メモリ制約、ランタイム方針によって大きく左右されます。そのため、アーキテクチャ、ソフトウェア実装、システム評価を一体として扱う研究を進めています。

**研究キーワード**

コンピュータアーキテクチャ · ドメイン特化アーキテクチャ · AI アクセラレータ · 非ノイマン型  
ハードウェア・ソフトウェア協調設計 · ニアメモリコンピューティング · 省電力・高効率コンピューティング  
LLM · 生成AI · 画像生成 · 音声認識 · 深層学習 · エッジAI

### 研究の視点

- 単独のカーネルではなく、実用的な AI システムとして成立するかを見る
- runtime breakdown やクロスプラットフォーム比較でボトルネックを定量化する
- 一つの実装知見を複数の AI ドメインへ再利用する
- エッジ向け試作からサーバ規模評価へつなげる

---

### NAIST での現在の研究

近年の LLM・生成AIの急速な発展はGPUへの需要を爆発的に増加させています。しかしGPUは本質的に電力効率を突き詰めた設計ではなく、膨大なメモリ帯域によって性能を確保しています。これはAIの持続的な発展を支える基盤として限界があります。

私は、フォン・ノイマン・ボトルネックを構造的に排除した**非ノイマン型コンピューティング**の普及が最も現実的かつインパクトの大きい次の一手であると考えています。ニアメモリ・インメモリコンピューティングとソフトウェアの協調設計によってこれを実現することが研究の目標です。

#### IMAX3/IMAX4 上での LLM 高速化

IMAX 上で Llama3・Qwen・Flan-T5 を実行し、詳細なボトルネック分析を実施。ホスト CPU と PCIe 帯域の制約を特定し、高性能サーバ CPU と PCIe Gen5 を搭載した IMAX4 の設計・評価によりサーバ規模のAIワークロードへのスケーラビリティを実証。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.25rem 0;">
  <img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax3andimax4.jpg" alt="IMAX3 と IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax4_proto.jpg" alt="IMAX4 プロトタイプ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

**発表:** IEEE Access (2025), SOCC 2025, SASIMI 2025 [Young Researcher Award], ICISN 2026 [Best Paper]

**主な成果:** 28nm 見積評価で RTX 4090 比 44.4 倍の PDP 改善、Q-Snap による 1.62 倍の prefill 高速化、IMAX4 移行による大幅なホスト側オーバーヘッド削減。

#### 生成AI — Stable Diffusion の IMAX 実装

Stable Diffusion を IMAX 上に実装し、CGLA アーキテクチャがテキスト生成以外の多様な生成 AI ワークロードにも対応できることを実証。

**発表:** MCSoC 2025

**着眼点:** LLM 向けに構築した量子化カーネルを画像生成へどこまで再利用できるか、また F16 / F32 演算がどこで制約になるかを明らかにすること。

#### 音声認識 — Whisper の IMAX 実装

Whisper ASR を IMAX に実装し、独自の FP16 演算カーネルを開発。省電力推論を実現しながら CGLA の汎用性を実証。

**発表:** CANDAR 2025 [Best Paper]

**着眼点:** ホスト CPU と IMAX の混合実行、独自 FP16 カーネル設計、モデルサイズや量子化設定をまたいだ電力効率評価。

---

### 高専での研究

#### 物体検出 — 小ねぎ分岐部検出

エッジデバイス上での小ねぎ自動調製向け分岐部検出アルゴリズムを開発。古典的エッジ検出と YOLO・Mask-RCNN 深層学習を組み合わせ、リソース制約デバイス上での精度と軽量化を両立した。

#### AI 推論の FPGA 実装 — 表情認識システム

DPU ベースの DNN アクセラレータを用いた時分割マルチタスクにより、単一ハードウェア上で2つの DNN モデルを実行するシステムを実装。組み込み CPU と比較して優れたフレームレートと電力効率を実証。

<div markdown="0" style="margin:1.25rem 0;">
  <img src="{{ site.url }}{{ site.baseurl }}/assets/images/fpga_system_fig.png" alt="FPGA システム構成" style="max-width:480px;width:100%;border:1px solid #E2E8F0;">
</div>

### 現在の関心

直近では、異種 AI ワークロードを支える統合ソフトウェアスタック、SSM や新しい LLM 系モデルの効率実行、アクセラレータ研究を再現しやすく比較しやすくするためのシステム評価手法に強い関心があります。

{% endif %}
