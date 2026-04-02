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

This research implements a **stand-alone facial expression recognition system** on a SoC FPGA using a **DPU** (Deep Learning Processing Unit, a systolic array CNN accelerator), with a **multi-threading** technique enabling high DPU utilization across both models.

### System Design

The system consists of two inference stages running on a single DPU:

1. **Face detection** (DenseBox-based): locates face regions in the camera frame
2. **Expression classification** (lightweight CNN): classifies the detected region into emotion categories

Rather than time-multiplexing at the frame level, a **multi-threading** approach is used to overlap DPU execution and CPU-side preprocessing, maximizing hardware utilization and overall system throughput.

**Results**

- End-to-end throughput: **25 FPS**
- Throughput-per-power: **2.4× improvement** over prior single-threaded implementation
- Unified DPU design avoids duplication of FPGA resources

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/fpga_system_fig.png' | relative_url }}" alt="FPGA system overview" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/fer_system.png' | relative_url }}" alt="Expression recognition system" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

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

リアルタイム表情認識では、顔検出と表情分類の2つの DNN モデルを逐次実行する必要があります。組み込み CPU 上での両モデル実行は、計算制約と電力効率の悪さから実用的ではありません。

本研究では、DPU（ディープラーニング処理ユニット、シストリックアレイ型 CNN アクセラレータ）を用いた SoC FPGA 上に**スタンドアロン表情認識システム**を実装し、**マルチスレッディング**手法により両モデルにまたがる高い DPU 利用率を実現します。

### システム設計

単一 DPU 上で動作する2段階推論パイプライン：

1. **顔検出**（DenseBox ベース）：カメラフレーム中の顔領域を検出
2. **表情分類**（軽量 CNN）：検出領域を感情カテゴリに分類

フレームレベルの時分割ではなく**マルチスレッディング**アプローチにより、DPU 実行と CPU 側前処理をオーバーラップさせてハードウェア利用率を最大化し、システム全体のスループットを向上させます。

**結果**

- エンドツーエンドスループット：**25 FPS**
- スループット/消費電力：従来のシングルスレッド実装比 **2.4倍改善**
- 統一 DPU 設計により FPGA リソースの重複を回避

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/fpga_system_fig.png' | relative_url }}" alt="FPGA システム概要" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/fer_system.png' | relative_url }}" alt="表情認識システム" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **ICIC Express Letters** | Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA |
| 2024 | **CANDARW 2024** | Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA |

{% endif %}
