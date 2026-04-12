---
permalink: /research/green-onion-dnn/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## DNN-Based Green Onion Branching Point Detection

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">ICIC Express Letters 2026</span>
  <span class="bp-tag">YOLOX</span>
  <span class="bp-tag">Instance Segmentation</span>
</div>

### Overview

This page focuses on the DNN-based approach for green onion branching point detection. Unlike the edge-detection method, this line of work targets scenes with complex backgrounds and lighting conditions where classical image processing alone is not sufficient.

The goal is to build a practical recognition pipeline for automated peeling systems by combining lightweight object detection and segmentation-based understanding.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_yolo.png' | relative_url }}" alt="YOLOX detection result" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/negi_seg.png' | relative_url }}" alt="Segmentation result" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Key Points

**YOLOX-Based Detection**

I studied a lightweight YOLOX-based method to locate branching points under more difficult real-world conditions.

**Segmentation-Oriented Analysis**

In addition to detection, instance segmentation was investigated as a way to better capture trimming-related structures around the branching region.

**Application Direction**

This work is positioned as a recognition pipeline for automated green onion peeling, complementing the lighter edge-based method.

### Related Publications

| Year | Venue | Title |
|------|-------|-------|
| 2026 | **ICIC Express Letters** | Lightweight YOLOX-based Green Onion Branching Point Detection for Automated Peeling on Edge Device |
| 2024 | **IEICE Kyushu Student Conference** | Instance segmentation for green onion trimming position detection |

{% else %}

## DNNベースの小ねぎ分岐部検出

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">ICIC Express Letters 2026</span>
  <span class="bp-tag">YOLOX</span>
  <span class="bp-tag">Instance Segmentation</span>
</div>

### 概要

このページでは、小ねぎ分岐部検出のうち DNN ベースの手法を扱います。エッジ検出中心の手法とは異なり、背景や照明条件が複雑な環境でも安定して検出できる認識系として整理しています。

軽量な物体検出とセグメンテーションを組み合わせることで、自動調製機に接続可能な実用的な認識パイプラインを構築することを目的としています。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_yolo.png' | relative_url }}" alt="YOLOX 検出結果" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/negi_seg.png' | relative_url }}" alt="セグメンテーション結果" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 主なポイント

**YOLOX ベースの検出**

実環境に近い条件で分岐部を検出するため、軽量な YOLOX ベースの手法を検討しました。

**セグメンテーションによる補助**

検出だけでなく、分岐部周辺の構造をより細かく捉えるために、インスタンスセグメンテーションもあわせて検討しました。

**応用先**

この研究は、小ねぎ自動調製機に向けた認識パイプラインとして位置づけており、軽量なエッジ検出手法を補完する系統です。

### 関連発表

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2026 | **ICIC Express Letters** | Lightweight YOLOX-based Green Onion Branching Point Detection for Automated Peeling on Edge Device |
| 2024 | **電子情報通信学会九州支部学生会講演会** | 小ねぎ調製位置検出のためのインスタンスセグメンテーション |

{% endif %}
