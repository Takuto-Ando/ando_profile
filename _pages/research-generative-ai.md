---
permalink: /research/generative-ai/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Generative AI on IMAX (CGLA)

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">MCSoC 2025</span>
</div>

### Overview

Image generation models like **Stable Diffusion** demand massive compute and memory bandwidth, making them prime candidates for hardware acceleration. Unlike LLMs which are dominated by matrix-vector multiplications, Stable Diffusion involves a U-Net denoising loop, cross-attention, and VAE decoding — presenting distinct data flow challenges for CGLA execution.

This research presents the first implementation and evaluation of the primary computational kernels from the **stable-diffusion.cpp** framework on **IMAX3**, assessing its capabilities for demanding image generation workloads.

### Key Contributions

**Kernel Reuse from LLM Framework**

Reused and adapted quantized dot-product kernels (Q8_0, Q3_K) developed for LLM inference, demonstrating that IMAX's kernel library is transferable across AI domains. This validates the architectural versatility of CGLA beyond text-generation workloads.

**Dual-Model Evaluation**

Evaluated both Q3_K and Q8_0 quantization configurations, analyzing the performance-accuracy tradeoff for image generation on CGLA hardware.

**Cross-Domain Versatility**

Demonstrates IMAX's capability across both vision (Stable Diffusion) and language (LLM) domains using a common hardware substrate, confirming CGLA as a general-purpose AI acceleration platform.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX architecture" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2025 | **MCSoC 2025** | Implementation and Evaluation of Stable Diffusion on a General-Purpose CGLA Accelerator |

{% else %}

## 生成 AI の IMAX（CGLA）上での実装

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">MCSoC 2025</span>
</div>

### 概要

**Stable Diffusion** のような画像生成モデルは膨大な演算とメモリ帯域を要求し、ハードウェアアクセラレーションの主要な対象となっています。LLM が行列ベクトル乗算に支配されているのとは異なり、Stable Diffusion は U-Net デノイジングループ・クロスアテンション・VAE デコードを含み、CGLA 実行において異なるデータフロー設計が必要です。

本研究では、**stable-diffusion.cpp** フレームワークの主要演算カーネルを **IMAX3** 上に初めて実装・評価し、要求の高い画像生成ワークロードに対するCGLA の性能を検証します。

### 主な成果

**LLM フレームワークからのカーネル再利用**

LLM 推論向けに開発した量子化ドット積カーネル（Q8_0・Q3_K）を再利用・適用し、IMAX のカーネルライブラリが AI ドメインをまたいで転用可能であることを実証。テキスト生成を超えた CGLA の汎用性を確認しました。

**デュアルモデル評価**

Q3_K と Q8_0 の2つの量子化設定を評価し、CGLA ハードウェア上での画像生成における性能・精度トレードオフを分析しました。

**ドメイン横断の汎用性**

共通ハードウェア基盤上での画像生成（Stable Diffusion）と言語処理（LLM）の両対応を実証し、CGLA を汎用 AI アクセラレーションプラットフォームとして確立しました。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX アーキテクチャ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **MCSoC 2025** | Implementation and Evaluation of Stable Diffusion on a General-Purpose CGLA Accelerator |

{% endif %}
