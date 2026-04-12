---
permalink: /presentations/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Presentation Materials

Slides and posters from my research presentations are available below.
These materials cover AI acceleration on CGLA architectures and image processing research.

This page is intended as a visual companion to the publications list. If you want a faster overview of motivation, architecture, experimental setup, and results, these decks and posters are often the easiest entry point.

### What You Can Find Here

- Slides that explain research background and system design
- Posters that summarize key results in a compact visual format
- Materials spanning both current NAIST research and earlier FPGA / vision work

### Slides

**IMAX3 & IMAX4 Performance Evaluation**

<div style="position:relative;display:block;margin:0 auto;width:100%;max-width:780px;padding-bottom:56%;margin-bottom:2rem;">
  <iframe src="https://speakerdeck.com/player/1b0060b0e2974a659464493d58e16eb0"
    title="IMAX3/IMAX4 Performance Evaluation"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:1px solid #E2E8F0;">
  </iframe>
</div>

**Green Onion Segmentation Research**

<div style="position:relative;display:block;margin:0 auto;width:100%;max-width:780px;padding-bottom:56%;margin-bottom:2rem;">
  <iframe src="https://speakerdeck.com/player/f027bc23215946868b187e68bec91c37"
    title="Green Onion Branching Point Segmentation"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:1px solid #E2E8F0;">
  </iframe>
</div>

### Posters

**CGLA-related Research**

These posters summarize the transition from accelerator implementation to system-level analysis, including IMAX3/IMAX4 evaluation and conference presentation materials.

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/socc_poster.png" alt="SOCC 2025 Poster" style="display:block;margin:1rem auto 1.5rem;max-width:500px;width:100%;border:1px solid #E2E8F0;">

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/sasimi2025_poster.png" alt="SASIMI 2025 Poster" style="display:block;margin:1rem auto 2rem;max-width:500px;width:100%;border:1px solid #E2E8F0;">

**Facial Expression Recognition (FPGA)**

Research poster presented at SASIMI 2024. Demonstrates low-power, high-performance DNN inference using CGRA and FPGA hardware acceleration.

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/sasimi_poster.png" alt="SASIMI 2024 Poster" style="display:block;margin:1rem auto 2rem;max-width:500px;width:100%;border:1px solid #E2E8F0;">

{% else %}

## 発表資料

研究発表で使用したスライドとポスター資料を公開しています。
AI アクセラレータや画像処理に関する取り組みを視覚的にご確認いただけます。


### 掲載内容

- 研究背景やシステム構成を説明するスライド
- 主要結果をコンパクトにまとめたポスター
- NAIST での現在の研究と、過去の FPGA / 画像処理研究の両方に関する資料

### スライド

**IMAX3・IMAX4 性能評価スライド**

<div style="position:relative;display:block;margin:0 auto;width:100%;max-width:780px;padding-bottom:56%;margin-bottom:2rem;">
  <iframe src="https://speakerdeck.com/player/1b0060b0e2974a659464493d58e16eb0"
    title="IMAX3・IMAX4 性能評価スライド"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:1px solid #E2E8F0;">
  </iframe>
</div>

**小ねぎ分岐部セグメンテーション研究スライド**

<div style="position:relative;display:block;margin:0 auto;width:100%;max-width:780px;padding-bottom:56%;margin-bottom:2rem;">
  <iframe src="https://speakerdeck.com/player/f027bc23215946868b187e68bec91c37"
    title="小ねぎ調製位置検出のためのインスタンスセグメンテーション"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:1px solid #E2E8F0;">
  </iframe>
</div>

### ポスター

**CGLA 関連研究**

これらのポスターでは、アクセラレータ実装からシステムレベルの評価に至る流れや、IMAX3 / IMAX4 の比較、国際会議での発表内容を視覚的に確認できます。

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/socc_poster.png" alt="SOCC 2025 ポスター" style="display:block;margin:1rem auto 1.5rem;max-width:500px;width:100%;border:1px solid #E2E8F0;">

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/sasimi2025_poster.png" alt="SASIMI 2025 ポスター" style="display:block;margin:1rem auto 2rem;max-width:500px;width:100%;border:1px solid #E2E8F0;">

**表情認識の研究（FPGA）**

SASIMI 2024 で発表したポスターです。CGRA と FPGA を活用した低消費電力・高性能 DNN 推論実装のポイントを解説しています。

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/sasimi_poster.png" alt="SASIMI 2024 ポスター" style="display:block;margin:1rem auto 2rem;max-width:500px;width:100%;border:1px solid #E2E8F0;">

{% endif %}
