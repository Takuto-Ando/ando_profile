---
permalink: /research/green-onion-edge/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Edge-Detection-Based Green Onion Branching Point Detection

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">Agricultural Information Research 2024</span>
  <span class="bp-tag">Edge Detection</span>
  <span class="bp-tag">Raspberry Pi 3</span>
</div>

### Overview

This page focuses only on the classical image-processing approach for green onion branching point detection. The target is a lightweight method that can run on resource-constrained edge devices without relying on neural-network inference.

The idea is to detect characteristic diagonal line patterns around the branching point and use them to estimate the trimming position for automated peeling.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_machine.jpg' | relative_url }}" alt="Green onion trimming machine" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/branch_example.png' | relative_url }}" alt="Branching point example" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Key Points

**Method**

The method uses edge-based image processing to extract branch-specific diagonal structures instead of using a heavy recognition model.

**Target Environment**

The design goal is implementation on low-power edge devices with limited computational resources.

**Observed Result**

Evaluation on Raspberry Pi 3 achieved **90.6%** detection rate for branching-point diagonal lines with **455 ms** processing time.

### Related Publications

| Year | Venue | Title |
|------|-------|-------|
| 2024 | **Agricultural Information Research** | Edge-device real-time branching-point detection for green onions |
| 2023 | **IPSJ ARC Workshop** | Detection of Welsh onion branching points using edge detection |

{% else %}

## エッジ検出による小ねぎ分岐部検出

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">農業情報研究 2024</span>
  <span class="bp-tag">Edge Detection</span>
  <span class="bp-tag">Raspberry Pi 3</span>
</div>

### 概要

このページでは、小ねぎ分岐部検出のうち、ニューラルネットワークを使わない古典的画像処理ベースの手法だけを扱います。対象は、計算資源の限られたエッジデバイス上でも動作できる軽量な検出方法です。

分岐部付近に現れる特有の斜線パターンに着目し、その形状を抽出することで自動調製機に必要な投入位置を推定します。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_machine.jpg' | relative_url }}" alt="小ねぎ調製機" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/branch_example.png' | relative_url }}" alt="分岐部の例" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 主なポイント

**手法**

重い認識モデルを使わず、エッジ検出ベースの画像処理によって、分岐部に特徴的な斜線構造を抽出します。

**対象環境**

低消費電力で演算能力の限られたエッジデバイス上での実装を前提に設計しています。

**確認できた結果**

Raspberry Pi 3 における評価では、分岐部斜線の検出率 **90.6%**、処理時間 **455 ms** を確認しました。

### 関連発表

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2024 | **農業情報研究** | エッジデバイス上におけるリアルタイム小ねぎ分岐部位置検出 |
| 2023 | **情処ARC研究発表会** | エッジ検出を用いたこねぎ分岐部の検出 |

{% endif %}
