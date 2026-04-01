---
permalink: /research/green-onion/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Green Onion Branching Point Detection

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">ICIC Express Letters 2026</span>
  <span class="bp-tag">農業情報研究 2024</span>
</div>

### Overview

Automated trimming of green onions (welsh onions) is a critical challenge in agricultural robotics. To cut at the correct position, a system must accurately detect **branching points** — the locations where outer leaves diverge from the main stalk. This is difficult due to the irregular, overlapping geometry of green onion bundles and the varying lighting conditions in production environments.

This research developed a branching-point detection algorithm combining **classical image processing** with **deep learning object detection**, targeting deployment on resource-constrained edge devices.

### Approach

**Stage 1: Classical Edge Detection**

For cases where background contrast is sufficient, edge detection (Canny / Sobel) combined with geometric feature extraction can locate branching points with high frame rate and low power. This avoids the overhead of neural network inference when simpler methods suffice.

**Stage 2: Deep Learning (YOLO / Mask-RCNN)**

When lighting and background conditions are complex, classical methods fail. I implemented and evaluated **YOLOv8** for bounding-box detection and **Mask-RCNN** for instance segmentation of individual leaves, enabling precise branching-point localization under real-world conditions.

**Lightweight Edge Optimization**

Model pruning and quantization were applied to fit the deep learning pipeline within the compute budget of edge devices used in agricultural settings.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/negi_yolo.png' | relative_url }}" alt="YOLO detection result" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/negi_seg.png' | relative_url }}" alt="Segmentation result" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2026 | **ICIC Express Letters** | Branching Point Detection for Automated Green Onion Trimming Using Instance Segmentation |
| 2024 | **農業情報研究** | Edge-Device Object Detection for Green Onion Harvesting Automation |

{% else %}

## 小ねぎ分岐部検出

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">ICIC Express Letters 2026</span>
  <span class="bp-tag">農業情報研究 2024</span>
</div>

### 概要

小ねぎ（ねぎ）の自動調製における適切な切断位置の特定は農業ロボティクスの重要課題です。正確な切断には**分岐部**（外葉が主茎から分岐する位置）の検出が必要です。しかし、小ねぎ束の不規則で重なり合う形状や、生産環境での照明条件の変化により、これは困難な問題です。

本研究では、**古典的画像処理**と**深層学習物体検出**を組み合わせた分岐部検出アルゴリズムを開発し、リソース制約のあるエッジデバイスへの展開を目指しました。

### アプローチ

**Stage 1：古典的エッジ検出**

背景コントラストが十分な場合、エッジ検出（Canny / Sobel）と幾何学的特徴抽出を組み合わせることで、高フレームレート・低消費電力での分岐部位置特定が可能です。ニューラルネットワーク推論の不要なシーンでは、より単純な手法で対応します。

**Stage 2：深層学習（YOLO / Mask-RCNN）**

照明や背景条件が複雑な場合は古典的手法では対応できません。バウンディングボックス検出に **YOLOv8**、葉のインスタンスセグメンテーションに **Mask-RCNN** を実装・評価し、実環境での正確な分岐部特定を実現しました。

**エッジ向け軽量化**

農業現場のエッジデバイスの演算予算に収めるため、モデルの剪定と量子化を適用しました。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/negi_yolo.png' | relative_url }}" alt="YOLO 検出結果" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/negi_seg.png' | relative_url }}" alt="セグメンテーション結果" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2026 | **ICIC Express Letters** | Branching Point Detection for Automated Green Onion Trimming Using Instance Segmentation |
| 2024 | **農業情報研究** | Edge-Device Object Detection for Green Onion Harvesting Automation |

{% endif %}
