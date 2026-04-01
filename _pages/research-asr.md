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

Automatic Speech Recognition (ASR) is a computationally intensive task that powers voice interfaces, transcription services, and accessibility tools. **Whisper**, OpenAI's state-of-the-art ASR model, combines a transformer encoder-decoder architecture with mel-spectrogram preprocessing — presenting unique challenges for non-GPU hardware.

This research ports **Whisper** to IMAX, demonstrating that CGLA can efficiently handle audio AI workloads in addition to text and image generation.

### Key Contributions

**Custom FP16 Kernel Implementation**

Whisper relies heavily on FP16 (half-precision floating-point) arithmetic, which is not natively supported by IMAX's default data path. I implemented a **custom FP16 computational kernel** optimized for the CGLA linear array, enabling accurate and efficient inference without sacrificing the energy benefits of the architecture.

**Energy-Efficient ASR Inference**

Compared to GPU-based Whisper deployment, the IMAX implementation achieves significant reductions in power consumption while maintaining transcription accuracy. This makes it suitable for edge deployment in power-constrained environments.

**Architectural Generality**

The successful Whisper port — requiring custom numeric format support — demonstrates IMAX's architectural flexibility beyond fixed-datatype workloads, validating CGLA as a versatile AI acceleration platform.

<div markdown="0" style="margin:1.5rem 0;">
  <img src="{{ '/assets/images/candar_award2.png' | relative_url }}" alt="CANDAR 2025 Best Paper Award" style="max-width:480px;width:100%;border:1px solid #E2E8F0;">
</div>

### Publications

| Year | Venue | Title |
|------|-------|-------|
| 2025 | **CANDAR 2025** 🏆 Best Paper | Whisper ASR on CGLA with Custom FP16 Kernel |
| 2025 | **arXiv** 2511.02269 | Energy-Efficient Speech Recognition on Non-von Neumann Accelerator |

{% else %}

## 音声認識（ASR）の IMAX（CGLA）上での高効率実装

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
  <span class="bp-tag">arXiv:2511.02269</span>
</div>

### 概要

自動音声認識（ASR）は、音声インターフェース・文字起こし・アクセシビリティツールを支える計算負荷の高いタスクです。OpenAI の最先端 ASR モデル **Whisper** は、トランスフォーマーエンコーダ・デコーダ構造とメルスペクトログラム前処理を組み合わせており、GPU 以外のハードウェアへの実装には固有の課題があります。

本研究では **Whisper** を IMAX 上に移植し、CGLA がテキスト・画像生成に加えて音声 AI ワークロードも効率的に処理できることを実証します。

### 主な成果

**独自 FP16 演算カーネルの実装**

Whisper は FP16（半精度浮動小数点）演算に大きく依存していますが、IMAX のデフォルトデータパスでは直接サポートされていません。CGLA 線形アレイに最適化した **独自 FP16 演算カーネル** を実装し、アーキテクチャの省電力性を損なうことなく高精度な推論を実現しました。

**省電力 ASR 推論**

GPU ベースの Whisper と比較して、IMAX 実装は文字起こし精度を維持しながら大幅な消費電力削減を達成。電力制約のあるエッジ環境への展開に適しています。

**アーキテクチャの汎用性実証**

独自の数値フォーマットサポートを必要とする Whisper の移植成功により、IMAX が固定データ型ワークロードを超えた柔軟性を持つことを示し、汎用 AI アクセラレーションプラットフォームとしての価値を実証しました。

<div markdown="0" style="margin:1.5rem 0;">
  <img src="{{ '/assets/images/candar_award2.png' | relative_url }}" alt="CANDAR 2025 最優秀論文賞" style="max-width:480px;width:100%;border:1px solid #E2E8F0;">
</div>

### 発表論文

| 年 | 発表先 | タイトル |
|----|--------|----------|
| 2025 | **CANDAR 2025** 🏆 最優秀論文賞 | Whisper ASR on CGLA with Custom FP16 Kernel |
| 2025 | **arXiv** 2511.02269 | Energy-Efficient Speech Recognition on Non-von Neumann Accelerator |

{% endif %}
