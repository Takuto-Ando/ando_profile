---
permalink: /research/asr/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Speech Recognition (ASR) on IMAX (CGLA)

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
</div>

### Overview

Automatic Speech Recognition (ASR) powers voice interfaces, transcription services, and accessibility tools. **Whisper**, OpenAI's transformer-based ASR model, poses unique challenges for non-GPU hardware due to its encoder-decoder architecture and heavy reliance on FP16 arithmetic.

This research presents the **first implementation of Whisper ASR kernels on a CGRA** (IMAX), demonstrating energy-efficient inference with a custom FP16 computational kernel. The Whisper-tiny.en model is evaluated on an FPGA prototype with 28nm ASIC projections.

### Key Contributions

**Custom FP16 Kernel Design**

Whisper's inference relies heavily on half-precision (FP16) dot products in multi-head attention and feed-forward layers. Since IMAX does not natively support FP16, I implemented **inline FP16-to-FP32 conversion** via PE bit manipulation — avoiding dedicated hardware. Column-wise multithreading time-multiplexes 4 logical FMA operations on a single physical FPU, maximizing throughput. The optimal burst length of **16 elements** balances overhead against offload rate, with only ~5% of computation remaining on the CPU.

**Padding Optimization for Kernel Coverage**

Whisper's variable-length vectors require 32-byte alignment, which at baseline LMM sizes results in poor kernel coverage. By removing unnecessary padding and selecting an optimal LMM size of **32 KB**, kernel coverage improved dramatically from **1.39% to 93.80%** — with negligible power increase (0.665 W → 0.675 W per lane).

**Energy-Efficient ASR Inference**

Compared to GPU-based deployment, the IMAX implementation achieves significantly better energy efficiency while maintaining transcription accuracy, positioning CGLA as a sustainable edge ASR platform.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 and IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX architecture" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Results

End-to-end latency and energy efficiency for Whisper-tiny.en (10-second audio, 2-thread execution):

| Platform | FP16 Latency (s) | Q8_0 Latency (s) | FP16 PDP (J) | Q8_0 PDP (J) |
|----------|-------------------|-------------------|--------------|--------------|
| ARM CPU (host only) | 24.4 | 19.6 | — | — |
| **IMAX (28nm)** | **13.5** | **11.1** | **13.6** | **12.6** |
| Jetson AGX Orin | 1.6 | 1.6 | 24.0 | 24.0 |
| RTX 4090 | 0.49 | 0.50 | 120.1 | 124.0 |

Energy efficiency (PDP): IMAX achieves **1.90x** better energy than Jetson AGX Orin and **9.83x** better than RTX 4090 (Q8_0 model). While IMAX has higher latency, its power consumption of ~1.3 W (2-lane, Q8_0) makes it dramatically more energy-efficient.

| LMM Size | Baseline Coverage | Optimized Coverage |
|----------|-------------------|--------------------|
| 8 KB | 0.00% | 64.96% |
| 16 KB | 1.39% | 66.35% |
| **32 KB** | **1.39%** | **93.80%** |
| 128 KB | 94.49% | 100.00% |

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2025 | **CANDAR 2025** 🏆 Best Paper | Energy-Efficient Hardware Acceleration of Whisper ASR on a CGLA |

{% else %}

## 音声認識（ASR）の IMAX（CGLA）上での高効率実装

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
</div>

### 概要

自動音声認識（ASR）は音声インターフェースや文字起こしサービスを支える計算負荷の高いタスクです。OpenAI のトランスフォーマーベース ASR モデル **Whisper** は、エンコーダ・デコーダ構造と FP16 演算への依存性から、GPU 以外のハードウェアへの実装に固有の課題があります。

本研究では、**Whisper ASR カーネルの CGRA（IMAX）上への初実装**を行い、独自 FP16 演算カーネルによる省電力推論を実証しました。Whisper-tiny.en モデルを FPGA プロトタイプ上で評価し、28nm ASIC 性能を見積もります。

### 主な成果

**独自 FP16 カーネル設計**

Whisper の推論はマルチヘッドアテンションとフィードフォワード層における半精度（FP16）ドット積に大きく依存しています。IMAX は FP16 をネイティブサポートしていないため、PE のビット操作による**インライン FP16→FP32 変換**を実装し、専用ハードウェアを回避しました。列方向マルチスレッディングにより単一の物理 FPU 上で4つの論理 FMA をタイムマルチプレクスし、スループットを最大化。最適バースト長 **16要素** でオーバーヘッドとオフロード率のバランスを確保し、CPU に残る計算は約5%です。

**パディング最適化によるカーネルカバレッジ改善**

Whisper の可変長ベクトルは 32バイトアライメントを要求しますが、ベースラインの LMM サイズではカーネルカバレッジが低くなります。不要なパディングの除去と最適 LMM サイズ **32 KB** の選択により、カーネルカバレッジを **1.39% から 93.80%** に大幅改善 — 消費電力増加は無視できるレベル（レーンあたり 0.665 W → 0.675 W）です。

**省電力 ASR 推論**

GPU ベースの実装と比較して、IMAX は文字起こし精度を維持しながら大幅に優れたエネルギー効率を達成し、CGLA を持続可能なエッジ ASR プラットフォームとして位置づけます。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 と IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX アーキテクチャ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 実験結果

Whisper-tiny.en のエンドツーエンドレイテンシとエネルギー効率（10秒音声、2スレッド実行）：

| プラットフォーム | FP16 レイテンシ (s) | Q8_0 レイテンシ (s) | FP16 PDP (J) | Q8_0 PDP (J) |
|----------|-------------------|-------------------|--------------|--------------|
| ARM CPU（ホストのみ） | 24.4 | 19.6 | — | — |
| **IMAX (28nm)** | **13.5** | **11.1** | **13.6** | **12.6** |
| Jetson AGX Orin | 1.6 | 1.6 | 24.0 | 24.0 |
| RTX 4090 | 0.49 | 0.50 | 120.1 | 124.0 |

エネルギー効率（PDP）：IMAX は Jetson AGX Orin 比 **1.90倍**、RTX 4090 比 **9.83倍** の省電力を達成（Q8_0）。レイテンシは高いものの、消費電力 ~1.3 W（2レーン、Q8_0）により圧倒的なエネルギー効率を実現。

| LMM サイズ | ベースラインカバレッジ | 最適化後カバレッジ |
|----------|-------------------|--------------------|
| 8 KB | 0.00% | 64.96% |
| 16 KB | 1.39% | 66.35% |
| **32 KB** | **1.39%** | **93.80%** |
| 128 KB | 94.49% | 100.00% |

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **CANDAR 2025** 🏆 最優秀論文賞 | Energy-Efficient Hardware Acceleration of Whisper ASR on a CGLA |

{% endif %}
