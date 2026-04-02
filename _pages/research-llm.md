---
permalink: /research/llm/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## LLM Acceleration on IMAX (CGLA)

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
  <span class="bp-tag bp-tag--award">Young Researcher Award — SASIMI 2025</span>
  <span class="bp-tag">IEEE Access (2025)</span>
</div>

### Overview

Large Language Models (LLMs) demand substantial computational resources, resulting in high energy consumption on GPUs. To address this challenge, this research focuses on **IMAX** — a Coarse-Grained Linear Array (CGLA) accelerator developed at NAIST — as an effective alternative that provides a trade-off between energy efficiency and programmability.

IMAX's interleaved linear array structure places compute units and cache memory banks alternately, structurally reducing memory access latency and the von Neumann bottleneck.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 and IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 Prototype" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Key Contributions

**Multi-Quantization Kernel Implementation**

Implemented four distinct quantized kernel types for the Qwen LLM family on IMAX: FP16, Q8_0, Q3_K, and Q6_K. This hybrid execution model partitions tasks between host CPU and the CGLA accelerator, maximizing throughput across different model sizes and quantization configurations.

**Bottleneck Analysis on IMAX3**

Running LLMs on the edge-oriented IMAX3 prototype revealed that the primary performance bottleneck is host-accelerator data transfer latency, not the CGLA compute itself. This analysis directly informed the design of IMAX4.

**Q-Snap: Quantization-Aware Dynamic Chunking**

Identified that static workload chunking in existing frameworks exposes prohibitive data transfer overhead on CGLAs. Proposed **Q-Snap** — a scheduling strategy that dynamically determines chunk sizes based on runtime memory constraints and quantization alignment, achieving a **1.62× speedup** in the prefill phase over the unoptimized baseline.

**Server-Scale Evaluation on IMAX4**

Designed and evaluated **IMAX4** — featuring an Intel Xeon server CPU and PCIe Gen5 interconnect — to resolve the host-side bottlenecks identified on IMAX3. Demonstrated **44.4× PDP improvement** over RTX 4090 and **13.6× improvement** over Jetson AGX Orin.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX architecture" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/llama-web.png' | relative_url }}" alt="LLM on IMAX" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Results

Energy efficiency comparison (Qwen3 LLM family, Q8_0 quantization):

| Platform | Process | Power | PDP vs RTX 4090 | EDP vs RTX 4090 |
|----------|---------|-------|-----------------|-----------------|
| **IMAX (28nm proj.)** | **28nm** | **~6 W** | **44.4x better** | **11.5x better** |
| Jetson AGX Orin | 8nm | 60 W | ~3x better | — |
| GTX 1080 Ti | 16nm | 250 W | ~1.3x worse | — |
| RTX 4090 | 4nm | 450 W | 1.0x (baseline) | 1.0x (baseline) |

Q-Snap prefill performance (IMAX 28nm, Qwen3):

| Metric | Baseline | Q-Snap | Improvement |
|--------|----------|--------|-------------|
| Prefill throughput | 17.11 tok/s | 27.70 tok/s | **1.62x** |
| Decode throughput | 3.88 tok/s | 5.62 tok/s | 1.45x |

IMAX3 → IMAX4 host bottleneck reduction (LLaMA3 8B, Q8_0):

| Metric | IMAX3 | IMAX4 | Improvement |
|--------|-------|-------|-------------|
| CPU time | 1,462.4 s | 15.3 s | **95x** |
| Weight transfer (CPYIN) | 350.9 s | 3.0 s | 117x |
| E2E latency (2-lane) | 1,700 s | 112.3 s | 15x |

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2026 | **ICISN 2026** 🏆 Best Paper | Q-Snap: Quantization-Aware Dynamic Chunking for LLM Execution on a CGLA |
| 2025 | **IEEE Access** | Efficient Kernel Mapping and Comprehensive System Evaluation of LLM Acceleration on a CGLA |
| 2025 | **SASIMI 2025** 🏆 Young Researcher Award | A Detailed Analysis of LLM Execution on IMAX3 and Initial Evaluation of IMAX4 Prototype for Server Environment |

{% else %}

## LLM の IMAX（CGLA）上での高速化

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
  <span class="bp-tag bp-tag--award">Young Researcher Award — SASIMI 2025</span>
  <span class="bp-tag">IEEE Access (2025)</span>
</div>

### 概要

LLM（大規模言語モデル）は膨大な計算資源を要求し、GPU における高エネルギー消費の問題が顕在化しています。本研究では、エネルギー効率とプログラマビリティのトレードオフを提供する有効な代替手段として、NAIST で開発された CGLA（粗粒度再構成可能論理アレイ）アクセラレータ **IMAX** に着目します。

IMAX の交互配置線形アレイ構造は演算ユニットとキャッシュメモリバンクを交互に配置し、メモリアクセスレイテンシとフォン・ノイマン・ボトルネックを構造的に削減します。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 と IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 プロトタイプ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 主な成果

**マルチ量子化カーネル実装**

Qwen LLM ファミリーに対して、FP16・Q8_0・Q3_K・Q6_K の4種の量子化カーネルを IMAX 上に実装。ホスト CPU と CGLA アクセラレータ間でタスクを分割するハイブリッド実行モデルにより、様々なモデルサイズと量子化設定でスループットを最大化しました。

**IMAX3 上でのボトルネック分析**

エッジ指向プロトタイプ IMAX3 上で LLM を実行し、主なボトルネックが CGLA 演算ではなくホスト・アクセラレータ間のデータ転送レイテンシにあることを特定。この分析が IMAX4 設計の直接的な指針となりました。

**Q-Snap：量子化対応動的チャンキング**

既存フレームワークの静的チャンク分割が CGLA 上で過大なデータ転送オーバーヘッドをもたらすことを特定。実行時のメモリ制約と量子化アライメントに基づいてチャンクサイズを動的決定する **Q-Snap** スケジューリング戦略を提案し、プリフィルフェーズで未最適化ベースラインに対して **1.62倍の高速化** を達成しました。

**IMAX4 によるサーバスケール評価**

IMAX3 で特定したホスト側ボトルネックを解消するため、Intel Xeon サーバ CPU と PCIe Gen5 インターコネクトを搭載した **IMAX4** を設計・評価。RTX 4090 比 **44.4倍の PDP 改善**、Jetson AGX Orin 比 **13.6倍の改善** を実証しました。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX アーキテクチャ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/llama-web.png' | relative_url }}" alt="LLM on IMAX" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 実験結果

エネルギー効率比較（Qwen3 LLM ファミリー、Q8_0 量子化）：

| プラットフォーム | プロセス | 消費電力 | PDP vs RTX 4090 | EDP vs RTX 4090 |
|----------|---------|-------|-----------------|-----------------|
| **IMAX (28nm 見積)** | **28nm** | **~6 W** | **44.4倍改善** | **11.5倍改善** |
| Jetson AGX Orin | 8nm | 60 W | ~3倍改善 | — |
| GTX 1080 Ti | 16nm | 250 W | ~1.3倍劣勢 | — |
| RTX 4090 | 4nm | 450 W | 1.0倍（基準） | 1.0倍（基準） |

Q-Snap プリフィル性能（IMAX 28nm、Qwen3）：

| メトリック | ベースライン | Q-Snap | 改善 |
|--------|----------|--------|-------------|
| プリフィルスループット | 17.11 tok/s | 27.70 tok/s | **1.62倍** |
| デコードスループット | 3.88 tok/s | 5.62 tok/s | 1.45倍 |

IMAX3 → IMAX4 ホストボトルネック低減（LLaMA3 8B、Q8_0）：

| メトリック | IMAX3 | IMAX4 | 改善 |
|--------|-------|-------|-------------|
| CPU 時間 | 1,462.4 s | 15.3 s | **95倍** |
| 重み転送（CPYIN） | 350.9 s | 3.0 s | 117倍 |
| E2E レイテンシ（2レーン） | 1,700 s | 112.3 s | 15倍 |

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2026 | **ICISN 2026** 🏆 最優秀論文賞 | Q-Snap: Quantization-Aware Dynamic Chunking for LLM Execution on a CGLA |
| 2025 | **IEEE Access** | Efficient Kernel Mapping and Comprehensive System Evaluation of LLM Acceleration on a CGLA |
| 2025 | **SASIMI 2025** 🏆 若手研究賞 | A Detailed Analysis of LLM Execution on IMAX3 and Initial Evaluation of IMAX4 Prototype for Server Environment |

{% endif %}
