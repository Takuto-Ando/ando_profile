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

Real-time facial expression recognition is essential for human-robot interaction, affective computing, and accessibility applications. However, running two DNN models (face detection + expression classification) simultaneously on embedded CPUs is impractical — the compute demands exceed available resources.

This research implements a **time-division multi-tasking DNN system** on FPGA using a **DPU** (Deep Learning Processing Unit) accelerator, enabling real-time inference of two models on a single hardware unit with dramatically lower power than CPU-based solutions.

### System Design

**Dual-DNN Time-Division Execution**

Rather than instantiating two separate DPU cores (resource-intensive), I designed a single DPU that **time-multiplexes** between two DNN models:
1. **Face detection model** (YOLO-based): locates faces in the camera frame
2. **Expression classification model** (lightweight CNN): classifies detected faces into emotion categories

The two models alternate execution in each video frame, sharing the DPU hardware resources.

**FPGA Implementation (Xilinx DPU)**

Implemented on a Xilinx FPGA board using the Vitis AI DPU framework. The DPU provides fixed-function acceleration for convolutional operations, enabling high throughput without GPU-class power consumption.

**Results**

- Achieved **30+ FPS** end-to-end (face detection + expression classification)
- Power consumption: significantly lower than embedded CPU baseline
- Demonstrated viability of FPGA-based multi-task DNN for real-time edge AI

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/fpga_system_fig.png' | relative_url }}" alt="FPGA system overview" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/fer_system.png' | relative_url }}" alt="Expression recognition system" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2025 | **ICIC Express Letters** | Real-Time Facial Expression Recognition on FPGA Using Time-Division Multi-Tasking DPU |
| 2024 | **CANDARW 2024** | DPU-Based Multi-Task DNN Inference for Edge AI on FPGA |

{% else %}

## FPGA 上での表情認識システム

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">ICIC Express Letters 2025</span>
  <span class="bp-tag">CANDARW 2024</span>
</div>

### 概要

リアルタイム表情認識は、ヒューマンロボットインタラクション・感情コンピューティング・アクセシビリティアプリケーションに不可欠です。しかし、2つの DNN モデル（顔検出＋表情分類）を組み込み CPU 上で同時実行することは実用上困難で、計算需要が利用可能リソースを超えてしまいます。

本研究では、**DPU**（ディープラーニング処理ユニット）アクセラレータを用いた FPGA 上での **時分割マルチタスク DNN システム**を実装し、単一ハードウェア上で2つのモデルのリアルタイム推論を CPU ベースのソリューションより大幅な省電力で実現します。

### システム設計

**デュアル DNN 時分割実行**

2つの独立した DPU コアを用意する（リソース消費が大きい）代わりに、単一の DPU が2つの DNN モデルを**時分割多重**で実行するよう設計しました：
1. **顔検出モデル**（YOLO ベース）：カメラフレーム中の顔を検出
2. **表情分類モデル**（軽量 CNN）：検出した顔の感情カテゴリを分類

2つのモデルが各ビデオフレームで交互に実行され、DPU ハードウェアリソースを共有します。

**FPGA 実装（Xilinx DPU）**

Vitis AI DPU フレームワークを使用して Xilinx FPGA ボード上に実装。DPU は畳み込み演算の固定機能アクセラレーションを提供し、GPU クラスの消費電力なしに高スループットを実現します。

**結果**

- エンドツーエンド（顔検出＋表情分類）で **30+ FPS** を達成
- 消費電力：組み込み CPU ベースラインと比較して大幅に削減
- リアルタイムエッジ AI のための FPGA ベースマルチタスク DNN の実現可能性を実証

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/fpga_system_fig.png' | relative_url }}" alt="FPGA システム概要" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/fer_system.png' | relative_url }}" alt="表情認識システム" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **ICIC Express Letters** | Real-Time Facial Expression Recognition on FPGA Using Time-Division Multi-Tasking DPU |
| 2024 | **CANDARW 2024** | DPU-Based Multi-Task DNN Inference for Edge AI on FPGA |

{% endif %}
