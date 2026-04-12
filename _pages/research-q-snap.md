---
permalink: /research/q-snap/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Q-snap: LLM Execution Optimization for CGLA

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
  <span class="bp-tag">Q-snap</span>
  <span class="bp-tag">LLM</span>
</div>

### Overview

Q-snap is a scheduling method for LLM execution on CGLA systems. The focus is not on the whole IMAX platform, but on how to reduce transfer overhead caused by static chunking during prefill execution.

This work targets quantized LLM execution, where chunk boundaries and memory alignment strongly affect the amount of host-device communication. Q-snap dynamically chooses chunk sizes while respecting quantization constraints.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/LLMchat_demo.gif' | relative_url }}" alt="LLM demo on IMAX" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 prototype" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Key Points

**Problem Setting**

Static workload chunking exposes large data-transfer overhead on CGLA-based LLM execution, especially when quantized kernels are used.

**Method**

Q-snap determines chunk sizes dynamically from runtime memory constraints and quantization alignment. This keeps the execution practical without relying on a fixed partition chosen in advance.

**Observed Effect**

On the IMAX environment, Q-snap improved prefill throughput from **17.11 tok/s** to **27.70 tok/s**, corresponding to a **1.62x speedup**.

### Publication

| Year | Venue | Title |
|------|-------|-------|
| 2026 | **ICISN 2026** | Q-snap: Quantization-Aware Dynamic Chunking for LLM Execution on a CGLA |

{% else %}

## CGLA向けLLM実行最適化

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
  <span class="bp-tag">Q-snap</span>
  <span class="bp-tag">LLM</span>
</div>

### 概要

Q-snap は、CGLA 上で LLM を実行するときのスケジューリングを最適化するための手法です。IMAX 全体の評価ではなく、特にプリフィル実行時に静的なチャンク分割が生む転送オーバーヘッドの削減に焦点を当てています。

量子化された LLM では、チャンク境界やメモリアライメントの取り方によってホスト・デバイス間通信量が大きく変わります。Q-snap は量子化条件を満たしつつ、実行時のメモリ制約に応じてチャンクサイズを動的に決定します。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/LLMchat_demo.gif' | relative_url }}" alt="IMAX 上の LLM デモ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 プロトタイプ" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 主なポイント

**課題設定**

静的なワークロード分割では、量子化カーネルを使う LLM 実行時にデータ転送オーバーヘッドが大きくなり、CGLA 側の計算性能を十分に活かせません。

**手法**

Q-snap は、実行時のメモリ制約と量子化アライメントを見ながらチャンクサイズを動的に決めます。あらかじめ固定した分割に頼らず、実行条件に応じてより自然なサイズに調整できるのが特徴です。

**確認できた効果**

IMAX 環境において、プリフィルスループットは **17.11 tok/s** から **27.70 tok/s** に向上し、**1.62 倍** の高速化を確認しました。

### 関連発表

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2026 | **ICISN 2026** | Q-snap: Quantization-Aware Dynamic Chunking for LLM Execution on a CGLA |

{% endif %}
