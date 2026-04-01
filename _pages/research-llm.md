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
  <span class="bp-tag">SOCC 2025</span>
</div>

### Overview

The explosive growth of LLMs (Large Language Models) has made GPUs the de facto standard for AI inference. However, GPUs suffer from severe energy inefficiency due to the von Neumann bottleneck — a fundamental mismatch between compute and memory access patterns in transformer models.

My research implements and optimizes state-of-the-art LLMs — **Llama3**, **Qwen**, and **Flan-T5** — on **IMAX** (In-Memory Accelerator eXtension), a non-von Neumann CGLA developed at NAIST. IMAX structurally eliminates the von Neumann bottleneck by interleaving compute units with cache memory in a linear array.

### Key Contributions

**Bottleneck Analysis on IMAX3**

Running LLMs on the edge-oriented IMAX3 prototype revealed that the primary performance bottleneck is not the IMAX hardware itself, but the host CPU's token generation logic and PCIe data transfer latency. This insight guided the design of next-generation hardware.

**Q-snap: Quantization-Aware Dynamic Chunking**

To maximize IMAX's compute efficiency, I proposed **Q-snap**, a novel data layout method that dynamically chunks weight matrices according to quantization granularity. Q-snap reduces memory access overhead and improves cache utilization on the CGLA pipeline.

**Server-Scale Evaluation on IMAX4**

Based on the IMAX3 analysis, I designed and evaluated **IMAX4** — a server-oriented platform equipped with a high-performance CPU and PCIe Gen5 interconnect. IMAX4 demonstrated that the IMAX architecture scales to server-level LLM workloads, matching or exceeding GPU baselines in energy efficiency.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 and IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 Prototype" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/llama-web.png' | relative_url }}" alt="LLM on IMAX demo" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/ICISN_1.jpg' | relative_url }}" alt="ICISN 2026 presentation" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2026 | **ICISN 2026** 🏆 Best Paper | LLM Inference on a Non-von Neumann CGLA with Q-snap |
| 2025 | **IEEE Access** | Performance Analysis of LLM on IMAX |
| 2025 | **SOCC 2025** | Scalable LLM Acceleration on CGLA: IMAX4 Evaluation |
| 2025 | **SASIMI 2025** 🏆 Young Researcher Award | Bottleneck Analysis of LLM Inference on IMAX3 |

{% else %}

## LLM の IMAX（CGLA）上での高速化

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
  <span class="bp-tag bp-tag--award">Young Researcher Award — SASIMI 2025</span>
  <span class="bp-tag">IEEE Access (2025)</span>
  <span class="bp-tag">SOCC 2025</span>
</div>

### 概要

LLM（大規模言語モデル）の急速な発展により、AI推論におけるGPUへの依存が加速しています。しかし、GPUはトランスフォーマーモデルのメモリアクセスパターンとの根本的なミスマッチにより、エネルギー効率に大きな課題を抱えています。

本研究では、NAIST コンピューティング・アーキテクチャ研究室で開発された非ノイマン型 CGLA **IMAX**（In-Memory Accelerator eXtension）上で、**Llama3**・**Qwen**・**Flan-T5** などの最先端 LLM を実装・最適化しています。IMAX は演算ユニットとキャッシュメモリを交互配置した線形アレイ構造により、フォン・ノイマン・ボトルネックを構造的に排除しています。

### 主な成果

**IMAX3 上でのボトルネック分析**

エッジ指向プロトタイプ IMAX3 上で LLM を実行し、主なボトルネックが IMAX ハードウェア自体でなく、ホスト CPU のトークン生成処理と PCIe データ転送レイテンシにあることを特定しました。この知見が次世代ハードウェア設計の指針となりました。

**Q-snap：量子化対応動的チャンキング**

IMAX の演算効率を最大化するため、量子化粒度に応じて重み行列を動的にチャンク分割する **Q-snap** 手法を提案。メモリアクセスオーバーヘッドを削減し、CGLA パイプライン上のキャッシュ利用効率を改善します。

**IMAX4 によるサーバスケール評価**

IMAX3 の分析に基づき、高性能サーバ CPU と PCIe Gen5 インターフェースを搭載したサーバ指向プラットフォーム **IMAX4** を設計・評価。IMAX アーキテクチャがサーバ規模の LLM ワークロードにスケールすることを実証しました。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 と IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 プロトタイプ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/llama-web.png' | relative_url }}" alt="LLM on IMAX デモ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/ICISN_1.jpg' | relative_url }}" alt="ICISN 2026 発表" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2026 | **ICISN 2026** 🏆 Best Paper | LLM Inference on a Non-von Neumann CGLA with Q-snap |
| 2025 | **IEEE Access** | Performance Analysis of LLM on IMAX |
| 2025 | **SOCC 2025** | Scalable LLM Acceleration on CGLA: IMAX4 Evaluation |
| 2025 | **SASIMI 2025** 🏆 若手研究賞 | Bottleneck Analysis of LLM Inference on IMAX3 |

{% endif %}
