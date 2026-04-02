---
permalink: /research/facial-expression/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Facial Expression Recognition on FPGA

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">ICIC Express Letters 2025</span>
  <span class="bp-tag">CANDARW 2024</span>
</div>

### Overview

Real-time facial expression recognition requires running two DNN models in sequence — face detection followed by expression classification. Executing both on an embedded CPU is impractical due to compute constraints and poor power efficiency.

This research implements a **stand-alone facial expression recognition system** on a SoC FPGA using a **DPU** (Deep Learning Processing Unit, a systolic array CNN accelerator), with a **multi-threading** technique that dramatically improves DPU utilization from 22.85% to 78.44%.

### Key Contributions

**DenseBox-based Face Detection on DPU**

Previous work relied on the Haar Cascade detector, which suffers from low accuracy under variable illumination and profile views. By replacing it with **DenseBox** running on the DPU, face detection accuracy improved from AP **0.531 to 0.917** (evaluated on the AFW dataset with 205 images and 473 annotated faces) — a **1.73x improvement** — while simultaneously achieving **18.95x faster** inference (42.10 ms vs 798 ms).

**Multi-Threading for DPU Utilization**

Rather than time-multiplexing at the frame level, CPU-side preprocessing and DPU execution are **overlapped via multi-threading**. This increases DPU utilization from 22.85% (single-thread) to **78.44% (2-thread)**, nearly quadrupling hardware efficiency without adding new accelerator resources.

**Unified Dual-DNN Pipeline**

Two DNN models share a single DPU through time-division:
1. **DenseBox** (face detection): locates face regions in the camera frame
2. **Lightweight CNN** (expression classification): classifies detected faces into 7 emotion categories on FER-2013

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/fpga_system_fig.png' | relative_url }}" alt="FPGA system overview" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/fer_system.png' | relative_url }}" alt="Expression recognition system" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Results

| Metric | Value | Baseline | Improvement |
|--------|-------|----------|-------------|
| Face Detection AP (AFW) | **0.917** | 0.531 (Haar Cascade) | 1.73x |
| Detection Latency | **42.10 ms** | 798 ms (Haar Cascade) | 18.95x faster |
| FER Accuracy (FER-2013) | **67.4%** | 66% (prior work) | +1.4 pp |
| End-to-end FPS (2-thread) | **25 FPS** | 11.67 FPS (prior work) | 2.14x |
| Throughput per Watt | **9.26 FPS/W** | 5.07 FPS/W (prior work) | **2.4x** |
| DPU Utilization (2-thread) | **78.44%** | 22.85% (1-thread) | 3.4x |
| Power Consumption (2-thread) | **2.7 W** | 2.3 W (prior work) | — |

The multi-threading technique enables **25 FPS** at only 2.7 W, achieving **2.4x better throughput-per-watt** versus the prior single-threaded implementation. DPU utilization reaches 78.44%, demonstrating efficient resource sharing between the face detection and expression classification models.

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2025 | **ICIC Express Letters** | Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA |
| 2024 | **CANDARW 2024** | Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA |

{% else %}

## FPGA 上での表情認識システム

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">ICIC Express Letters 2025</span>
  <span class="bp-tag">CANDARW 2024</span>
</div>

### 概要

リアルタイム表情認識では、顔検出と表情分類の2つの DNN モデルを逐次実行する必要があります。組み込み CPU 上での両モデル実行は計算制約と電力効率の問題から実用的ではありません。

本研究では、DPU（ディープラーニング処理ユニット、シストリックアレイ型 CNN アクセラレータ）を用いた SoC FPGA 上に**スタンドアロン表情認識システム**を実装し、**マルチスレッディング**手法により DPU 利用率を 22.85% から 78.44% に大幅改善します。

### 主な成果

**DenseBox ベースの DPU 顔検出**

先行研究では可変照明やプロファイルビューで精度が低い Haar Cascade 検出器を使用していました。これを DPU 上で動作する **DenseBox** に置き換えることで、顔検出精度を AP **0.531 から 0.917** に改善（AFW データセット：205画像、473個のアノテーション顔で評価）— **1.73倍の改善** — さらに推論速度も **18.95倍高速化**（42.10 ms vs 798 ms）。

**マルチスレッディングによる DPU 利用率向上**

フレームレベルの時分割ではなく、CPU 側前処理と DPU 実行を**マルチスレッディングによりオーバーラップ**。DPU 利用率をシングルスレッドの 22.85% から **2スレッドで 78.44%** に向上させ、新たなアクセラレータリソースの追加なしにハードウェア効率をほぼ4倍に改善。

**統一デュアル DNN パイプライン**

2つの DNN モデルが時分割で単一 DPU を共有：
1. **DenseBox**（顔検出）：カメラフレーム中の顔領域を検出
2. **軽量 CNN**（表情分類）：検出した顔を FER-2013 の7感情カテゴリに分類

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/fpga_system_fig.png' | relative_url }}" alt="FPGA システム概要" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/fer_system.png' | relative_url }}" alt="表情認識システム" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 実験結果

| メトリック | 値 | ベースライン | 改善 |
|--------|-------|----------|-------------|
| 顔検出 AP (AFW) | **0.917** | 0.531 (Haar Cascade) | 1.73倍 |
| 検出レイテンシ | **42.10 ms** | 798 ms (Haar Cascade) | 18.95倍高速化 |
| FER 精度 (FER-2013) | **67.4%** | 66% (先行研究) | +1.4 pp |
| エンドツーエンド FPS (2スレッド) | **25 FPS** | 11.67 FPS (先行研究) | 2.14倍 |
| スループット/消費電力 | **9.26 FPS/W** | 5.07 FPS/W (先行研究) | **2.4倍** |
| DPU 利用率 (2スレッド) | **78.44%** | 22.85% (1スレッド) | 3.4倍 |
| 消費電力 (2スレッド) | **2.7 W** | 2.3 W (先行研究) | — |

マルチスレッディング手法により **25 FPS** をわずか 2.7 W で達成し、先行研究のシングルスレッド実装比 **2.4倍のスループット/消費電力**を実現。DPU 利用率は 78.44% に達し、顔検出・表情分類モデル間の効率的なリソース共有を実証しました。

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **ICIC Express Letters** | Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA |
| 2024 | **CANDARW 2024** | Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA |

{% endif %}
