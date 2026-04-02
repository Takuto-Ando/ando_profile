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

This research presents the **first implementation and evaluation** of the primary computational kernels from the **stable-diffusion.cpp** framework on **IMAX3**, a general-purpose CGLA accelerator. We evaluate image generation performance on an FPGA prototype and project ASIC-level performance at 28nm.

### Key Contributions

**Kernel Reuse from LLM Framework**

Reused and adapted the quantized dot-product kernels (Q8_0, Q3_K) originally developed for LLM inference via the GGML tensor library. The Q8_0 kernel uses OP_SML8 (2-way SIMD 8-bit MACs) mapped across 46 PEs, while Q3_K uses a custom OP_CVT53 instruction across 51 PEs. This demonstrates that IMAX's kernel library is transferable across AI domains.

**Kernel Coverage Analysis**

Due to the heavy use of FP16/FP32 operations in Stable Diffusion's U-Net architecture, the CGLA offload ratio is limited. Kernel coverage for quantized operations is **10.3%** (Q3_K) and **16.3%** (Q8_0), with FP16 operations consuming 59–62% and FP32 consuming 22–31% of the total workload — all executed on the host CPU.

**Cross-Domain Versatility**

Despite the limited offload ratio, the successful execution of Stable Diffusion on IMAX — alongside LLMs and Whisper ASR — validates CGLA as a **general-purpose AI acceleration platform** spanning language, vision, and audio domains.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX architecture" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Results

End-to-end latency for 512x512 image generation (SD-Turbo, single denoising step) on IMAX3 FPGA prototype (VPK180, single-lane, 145 MHz):

| Platform | Q3_K (s) | Q8_0 (s) | Power |
|----------|----------|----------|-------|
| IMAX3 FPGA (145 MHz) | 790.3 | 654.7 | ~1.5 W (ARM) + kernel power |
| IMAX3 ASIC (28nm proj.) | 754.5 | 558.0 | ~53 W (Q3_K) / ~48 W (Q8_0) |
| Intel Xeon CPU | 59.3 | — | high |
| GTX 1080 Ti | 16.2 | — | 250 W |

The high latency on IMAX is primarily due to the limited kernel coverage (~10–16%); FP16/FP32 operations fall back to the host CPU. Despite this, Q3_K on IMAX ASIC achieves competitive **PDP (Power-Delay Product)** against the GPU baseline, demonstrating that even partial CGLA offloading provides energy advantages for compute-bound kernels.

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

**Stable Diffusion** のような画像生成モデルは膨大な演算とメモリ帯域を要求し、ハードウェアアクセラレーションの主要な対象です。LLM が行列ベクトル乗算に支配されるのとは異なり、Stable Diffusion は U-Net デノイジングループ・クロスアテンション・VAE デコードを含み、CGLA 実行において異なるデータフロー設計が必要です。

本研究では、**stable-diffusion.cpp** フレームワークの主要演算カーネルを汎用 CGLA アクセラレータ **IMAX3** 上に**初めて実装・評価**しました。FPGA プロトタイプでの画像生成性能を評価し、28nm ASIC レベルの性能を見積もります。

### 主な成果

**LLM フレームワークからのカーネル再利用**

GGML テンソルライブラリを通じて、LLM 推論向けに開発した量子化ドット積カーネル（Q8_0・Q3_K）を再利用・適用。Q8_0 カーネルは OP_SML8（2-way SIMD 8ビット MAC）を46個のPE上にマッピングし、Q3_K はカスタム OP_CVT53 命令を51個のPE上で実行します。IMAX のカーネルライブラリが AI ドメインをまたいで転用可能であることを実証しました。

**カーネルカバレッジ分析**

Stable Diffusion の U-Net アーキテクチャにおける FP16/FP32 演算の多用により、CGLA へのオフロード率は限定的です。量子化演算のカーネルカバレッジは **Q3_K で 10.3%**、**Q8_0 で 16.3%** に留まり、FP16 演算が 59〜62%、FP32 演算が 22〜31% を占め、いずれもホスト CPU 上で実行されます。

**ドメイン横断の汎用性**

限定的なオフロード率にもかかわらず、LLM・Whisper ASR に続く Stable Diffusion の IMAX 上での実行成功により、CGLA が言語・画像・音声にまたがる**汎用 AI アクセラレーションプラットフォーム**であることを確認しました。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX アーキテクチャ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 実験結果

512×512 画像生成のエンドツーエンドレイテンシ（SD-Turbo、デノイジング1ステップ）、IMAX3 FPGA プロトタイプ（VPK180、シングルレーン、145 MHz）：

| プラットフォーム | Q3_K (s) | Q8_0 (s) | 消費電力 |
|----------|----------|----------|-------|
| IMAX3 FPGA (145 MHz) | 790.3 | 654.7 | ~1.5 W (ARM) + カーネル電力 |
| IMAX3 ASIC (28nm 見積) | 754.5 | 558.0 | ~53 W (Q3_K) / ~48 W (Q8_0) |
| Intel Xeon CPU | 59.3 | — | 高 |
| GTX 1080 Ti | 16.2 | — | 250 W |

IMAX での高レイテンシは主にカーネルカバレッジの限界（~10–16%）に起因し、FP16/FP32 演算がホスト CPU にフォールバックします。それでも、IMAX ASIC 上の Q3_K は GPU ベースラインに対して競争力のある **PDP（電力遅延積）**を達成しており、部分的な CGLA オフロードでも演算バウンドカーネルにおけるエネルギー優位性があることを示しています。

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **MCSoC 2025** | Implementation and Evaluation of Stable Diffusion on a General-Purpose CGLA Accelerator |

{% endif %}
