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

Generative AI has rapidly expanded beyond text — image generation models like **Stable Diffusion** now require massive compute and memory bandwidth, making them a prime candidate for hardware acceleration.

This research implements **Stable Diffusion** on IMAX, demonstrating that the CGLA architecture is not limited to LLM workloads. Stable Diffusion involves a fundamentally different computational pattern (U-Net + attention + VAE decode), requiring tailored data flow optimization for the CGLA linear array.

### Key Contributions

**Full Pipeline Implementation**

Implemented the complete Stable Diffusion inference pipeline — text encoder, U-Net denoising loop, and VAE decoder — on IMAX, mapping each component to the CGLA dataflow model.

**End-to-End Energy Efficiency**

Evaluated image generation throughput and energy consumption, demonstrating that IMAX achieves comparable quality to GPU while significantly reducing power draw. This confirms CGLA's viability for diverse generative AI workloads beyond transformers.

**Architectural Versatility**

The successful port of Stable Diffusion alongside LLMs and Whisper demonstrates IMAX's generality as an AI accelerator — a key step toward CGLA becoming a universal platform for edge and server AI.

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2025 | **MCSoC 2025** | Stable Diffusion Inference on CGLA: IMAX Implementation and Evaluation |

{% else %}

## 生成 AI の IMAX（CGLA）上での実装

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">MCSoC 2025</span>
</div>

### 概要

生成AIはテキスト生成にとどまらず、**Stable Diffusion** のような画像生成モデルへと急速に拡大しています。これらのモデルは大規模な演算とメモリ帯域を要求するため、ハードウェアアクセラレーションの主要な対象となっています。

本研究では **Stable Diffusion** を IMAX 上に実装し、CGLA アーキテクチャが LLM ワークロードに限らない汎用性を持つことを実証します。Stable Diffusion は U-Net・アテンション・VAE デコードという根本的に異なる計算パターンを持ち、CGLA 線形アレイへの最適なデータフロー設計が必要です。

### 主な成果

**フルパイプライン実装**

テキストエンコーダ・U-Net デノイジングループ・VAE デコーダという Stable Diffusion の完全な推論パイプラインを IMAX 上に実装し、各コンポーネントを CGLA データフローモデルにマッピングしました。

**エンドツーエンドのエネルギー効率**

画像生成スループットと消費電力を評価。IMAX が GPU と同等の品質を維持しながら大幅な省電力を実現することを実証しました。

**アーキテクチャの汎用性**

LLM・Whisper に続く Stable Diffusion の移植成功により、IMAX がトランスフォーマーを超えた多様な生成 AI ワークロードに対応可能な汎用アクセラレータであることを示しました。

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **MCSoC 2025** | Stable Diffusion Inference on CGLA: IMAX Implementation and Evaluation |

{% endif %}
