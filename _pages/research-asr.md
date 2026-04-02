---
permalink: /research/asr/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## Speech Recognition (ASR) on IMAX (CGLA)

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
  <span class="bp-tag">arXiv:2511.02269</span>
</div>

### Overview

Automatic Speech Recognition (ASR) is a computationally intensive task powering voice interfaces and transcription services. **Whisper**, OpenAI's transformer-based ASR model, poses unique challenges for non-GPU hardware due to its encoder-decoder architecture and FP16 arithmetic requirements.

This research implements **Whisper** on IMAX, demonstrating that the CGLA architecture can efficiently handle audio AI workloads in addition to LLM and image generation.

### Key Contributions

**Custom FP16 Kernel Implementation**

Whisper's inference relies heavily on half-precision floating-point (FP16) arithmetic. Implemented a custom FP16 computational kernel optimized for the CGLA linear array pipeline, enabling accurate inference without sacrificing the architecture's energy advantages.

**Energy-Efficient ASR Inference**

Evaluated end-to-end inference performance and energy consumption on IMAX, demonstrating significant power reduction compared to GPU-based deployment while maintaining transcription accuracy.

**Architectural Versatility**

The successful Whisper port — requiring dedicated numeric format support — validates IMAX's generality as a platform for diverse AI workloads beyond transformers and vision models.

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 and IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/candar_award2.png' | relative_url }}" alt="CANDAR 2025 Best Paper Award" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2025 | **CANDAR 2025** 🏆 Best Paper | Energy-Efficient Hardware Acceleration of Whisper ASR on a CGLA |

{% else %}

## 音声認識（ASR）の IMAX（CGLA）上での高効率実装

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
  <span class="bp-tag">arXiv:2511.02269</span>
</div>

### 概要

自動音声認識（ASR）は音声インターフェースや文字起こしサービスを支える計算負荷の高いタスクです。OpenAI のトランスフォーマーベース ASR モデル **Whisper** は、エンコーダ・デコーダ構造と FP16 演算への依存性から、GPU 以外のハードウェアへの実装に固有の課題があります。

本研究では **Whisper** を IMAX 上に実装し、CGLA が LLM・画像生成に加えて音声 AI ワークロードも効率的に処理できることを実証します。

### 主な成果

**独自 FP16 演算カーネルの実装**

Whisper 推論は半精度浮動小数点（FP16）演算に大きく依存しています。CGLA 線形アレイパイプラインに最適化した独自 FP16 演算カーネルを実装し、アーキテクチャのエネルギー優位性を損なうことなく高精度な推論を実現しました。

**省電力 ASR 推論**

IMAX 上でのエンドツーエンド推論性能と消費電力を評価し、文字起こし精度を維持しながら GPU ベースと比較して大幅な省電力を達成。

**アーキテクチャの汎用性実証**

専用の数値フォーマットサポートを必要とする Whisper の移植成功により、IMAX がトランスフォーマーや画像モデルを超えた多様な AI ワークロードへの対応力を持つことを実証しました。

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;align-items:flex-start;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 と IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/candar_award2.png' | relative_url }}" alt="CANDAR 2025 最優秀論文賞" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **CANDAR 2025** 🏆 最優秀論文賞 | Energy-Efficient Hardware Acceleration of Whisper ASR on a CGLA |

{% endif %}
