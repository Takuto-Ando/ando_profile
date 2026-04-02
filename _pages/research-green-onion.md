---
permalink: /research/green-onion/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Green Onion Branching Point Detection

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">農業情報研究 2024</span>
</div>

### Overview

Automated trimming of green onions (welsh onions) is a key challenge in agricultural robotics. The trimming machine must cut at the **branching point** where outer leaves diverge from the main stalk. Accurate detection of this point is essential, as positioning errors directly affect peeling success rates.

This research develops a detection system combining **classical image processing** with **deep learning object detection**, targeting deployment on resource-constrained edge devices in agricultural production lines.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_machine.jpg' | relative_url }}" alt="Green onion trimming machine" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/branch_example.png' | relative_url }}" alt="Branching point detection example" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Key Contributions

**Classical Edge Detection for Simple Backgrounds**

For cases where background contrast is sufficient, edge detection (Canny / Sobel) combined with geometric feature extraction can locate branching points with high frame rate and low power, avoiding unnecessary neural network inference overhead.

**Deep Learning Detection (YOLOX)**

When lighting and background conditions are complex, classical methods fail. Implemented and evaluated YOLOX-based object detection for branching point localization under real-world production environments.

**Edge Device Deployment**

The detection pipeline runs on edge devices suitable for agricultural production lines, balancing accuracy with low power consumption.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_yolo.png' | relative_url }}" alt="YOLOX detection result" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/negi_seg.png' | relative_url }}" alt="Segmentation result" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2024 | **Agricultural Information Research** | Edge-device real-time branching-point detection for green onions |
| 2024 | **IEICE Kyushu Student Conference** | Instance segmentation for green onion trimming position detection |
| 2023 | **IPSJ ARC Workshop** | Detection of Welsh onion branching points using edge detection |

{% else %}

## 小ねぎ分岐部検出

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">農業情報研究 2024</span>
</div>

### 概要

小ねぎの自動調製は農業ロボティクスの重要課題です。調製機は外葉が主茎から分岐する**分岐部**で切断する必要があり、位置誤差は直接的に皮むき成功率に影響します。

本研究では、**古典的画像処理**と**深層学習物体検出**を組み合わせた検出システムを開発し、農業生産ラインのリソース制約エッジデバイスへの展開を目指しました。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_machine.jpg' | relative_url }}" alt="小ねぎ調製機" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/branch_example.png' | relative_url }}" alt="分岐部検出例" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 主な成果

**シンプルな背景での古典的エッジ検出**

背景コントラストが十分な場合、エッジ検出（Canny / Sobel）と幾何学的特徴抽出を組み合わせることで、高フレームレート・低消費電力での分岐部位置特定が可能です。不必要なニューラルネットワーク推論のオーバーヘッドを回避します。

**深層学習検出（YOLOX）**

照明や背景条件が複雑な場合は古典的手法では対応できません。実環境の生産現場を対象として YOLOX ベースの物体検出を実装・評価し、分岐部の正確な位置特定を実現しました。

**エッジデバイスへの実装**

農業生産ラインに適したエッジデバイス上で検出パイプラインを実行し、精度と低消費電力のバランスを実現します。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/negi_yolo.png' | relative_url }}" alt="YOLOX 検出結果" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/negi_seg.png' | relative_url }}" alt="セグメンテーション結果" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2024 | **農業情報研究** | エッジデバイス上におけるリアルタイム小ねぎ分岐部位置検出 |
| 2024 | **電子情報通信学会九州支部学生会講演会** | 小ねぎ調製位置検出のためのインスタンスセグメンテーション |
| 2023 | **情処ARC研究発表会** | エッジ検出を用いたこねぎ分岐部の検出 |

{% endif %}
