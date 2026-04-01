---
permalink: /home/
title: ""
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

<div class="bp-profile" markdown="0">
  <img class="bp-profile__img" src="{{ '/assets/images/ando2.png' | relative_url }}" alt="Takuto ANDO" onerror="this.style.background='#f1f5f9'">
  <div>
    <div class="bp-profile__name">Takuto ANDO <span style="font-size:1rem;font-weight:400;color:#94A3B8">安藤 拓翔</span></div>
    <div class="bp-profile__en">M2, Computing Architecture Lab · NAIST</div>
    <div class="bp-profile__aff">Nara Institute of Science and Technology</div>
    <div class="bp-profile__bio">
      I explore AI acceleration from a computer architecture perspective,
      pursuing hardware/software co-design for sustainable, energy-efficient computing.
      My research focuses on implementing and optimizing state-of-the-art AI models
      — LLMs, image generation, and speech recognition —
      on the non-von Neumann accelerator <strong>IMAX</strong>.
    </div>
    <div class="bp-profile__btns">
      <a class="bp-btn" href="https://researchmap.jp/takuto_ando">researchmap</a>
      <a class="bp-btn" href="https://github.com/Takuto-Ando">GitHub</a>
    </div>
  </div>
</div>

<div class="bp-stats" markdown="0">
  <div class="bp-stat"><div class="bp-stat__n">3</div><div class="bp-stat__l">Int'l Journals</div></div>
  <div class="bp-stat"><div class="bp-stat__n">10</div><div class="bp-stat__l">Int'l Conf.</div></div>
  <div class="bp-stat"><div class="bp-stat__n">7</div><div class="bp-stat__l">Awards</div></div>
  <div class="bp-stat"><div class="bp-stat__n">6</div><div class="bp-stat__l">Domestic</div></div>
</div>

<p class="bp-overview">
  Focusing on the power efficiency problem of GPUs, I am conducting research that implements and optimizes
  cutting-edge AI applications — including LLMs, Stable Diffusion, and Whisper — on <strong>IMAX</strong>,
  a non-von Neumann accelerator that structurally eliminates the von Neumann bottleneck.
  I pursue sustainable high-performance AI computing through hardware/software co-design.
</p>

<div class="bp-awards" markdown="0">
  <div class="bp-awards__ttl">Awards</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Best Paper Award — ICISN 2026</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Best Paper Award — CANDAR 2025</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Young Researcher Award — SASIMI 2025 (IEEE CEDA All Japan Joint Chapter)</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Student Encouragement Award — IPSJ 87th National Convention, 2025</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Encouragement Award (Excellence) — Japan KOSEN Association, 2025</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Student Commendation — KOSEN Organization, 2025</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Academic Encouragement Award — IEICE Kyushu Branch, 2025</div>
</div>

<div class="bp-sec" markdown="0">Gallery</div>

<div class="bp-photo-grid" markdown="0">
  <img src="{{ '/assets/images/ICISN_1.jpg' | relative_url }}" alt="ICISN 2026">
  <img src="{{ '/assets/images/ICISN_2.PNG' | relative_url }}" alt="ICISN 2026">
  <img src="{{ '/assets/images/sasimi2025_photo.jpg' | relative_url }}" alt="SASIMI 2025">
  <img src="{{ '/assets/images/sasimi_presen.jpg' | relative_url }}" alt="SASIMI presentation">
  <img src="{{ '/assets/images/sasimi_award.jpg' | relative_url }}" alt="SASIMI Award">
  <img src="{{ '/assets/images/zenkoku2025.jpg' | relative_url }}" alt="IPSJ 2025">
</div>

<div class="bp-sec" markdown="0">NAIST Research — 2025~</div>

<div class="bp-grid" markdown="0">
  <div class="bp-card" data-href="/research/llm/">
    <div class="bp-card__ttl">LLM Acceleration on CGLA</div>
    <div class="bp-card__body">
      Running Llama3, Qwen, and Flan-T5 on IMAX. Identified host-side bottlenecks and proposed
      <strong>Q-snap</strong>, a quantization-aware dynamic chunking method.
      Demonstrated server-scale performance on IMAX4.
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
      <span class="bp-tag bp-tag--award">Young Researcher — SASIMI 2025</span>
      <span class="bp-tag">IEEE Access</span>
      <span class="bp-tag">SOCC 2025</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/generative-ai/">
    <div class="bp-card__ttl">Generative AI on CGLA</div>
    <div class="bp-card__body">
      Implemented <strong>Stable Diffusion</strong> on IMAX, demonstrating CGLA's versatility
      beyond LLMs to diverse generative AI workloads. Evaluated end-to-end performance
      and energy efficiency.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">MCSoC 2025</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/asr/">
    <div class="bp-card__ttl">Speech Recognition (ASR) on CGLA</div>
    <div class="bp-card__body">
      Ported <strong>Whisper</strong> ASR to IMAX with a custom FP16 kernel implementation.
      Achieved energy-efficient inference while demonstrating the architectural generality of CGLA.
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
      <span class="bp-tag">arXiv:2511.02269</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/imax/">
    <div class="bp-card__ttl">IMAX Architecture</div>
    <div class="bp-card__body">
      <strong>IMAX</strong> (In-Memory Accelerator eXtension) is a non-von Neumann CGLA
      combining near-memory computing with systolic-array efficiency.
      Contributing to edge-oriented <strong>IMAX3</strong> and server-oriented <strong>IMAX4</strong>.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">CGRA / CGLA</span>
      <span class="bp-tag">Near-Memory Computing</span>
      <span class="bp-tag">Edge &amp; Server</span>
    </div>
  </div>
</div>

<div class="bp-sec" markdown="0">Past Research — College of Technology (~2025)</div>

<div class="bp-grid" markdown="0">
  <div class="bp-card" data-href="/research/green-onion/">
    <div class="bp-card__ttl">Computer Vision — Green Onion Detection</div>
    <div class="bp-card__body">
      Developed a branching-point detection algorithm for automated green onion trimming
      on edge devices using YOLO and Mask-RCNN. Combined classical image processing
      with deep learning for accuracy and lightweight execution.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">ICIC Express Letters 2026</span>
      <span class="bp-tag">農業情報研究 2024</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/facial-expression/">
    <div class="bp-card__ttl">FPGA / Edge AI — Facial Expression Recognition</div>
    <div class="bp-card__body">
      Implemented real-time facial expression recognition on FPGA using a DPU-based
      DNN accelerator with time-division multi-tasking. Achieved high frame rate
      and low power compared to embedded CPU.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">ICIC Express Letters 2025</span>
      <span class="bp-tag">CANDARW 2024</span>
    </div>
  </div>
</div>

{% else %}

<div class="bp-profile" markdown="0">
  <img class="bp-profile__img" src="{{ '/assets/images/ando2.png' | relative_url }}" alt="安藤 拓翔" onerror="this.style.background='#f1f5f9'">
  <div>
    <div class="bp-profile__name">安藤 拓翔 <span style="font-size:1rem;font-weight:400;color:#94A3B8">Takuto ANDO</span></div>
    <div class="bp-profile__en">博士前期課程2年 · コンピューティング・アーキテクチャ研究室</div>
    <div class="bp-profile__aff">奈良先端科学技術大学院大学</div>
    <div class="bp-profile__bio">
      AIや画像処理技術を計算機アーキテクチャの視点から探求し、持続可能で高効率なAI計算基盤の構築を目指す。
      LLM・生成AI・音声認識などの最先端AIアプリケーションを非ノイマン型アクセラレータ
      <strong>IMAX</strong> 上に実装・最適化するハードウェア・ソフトウェア協調設計の研究に従事。
    </div>
    <div class="bp-profile__btns">
      <a class="bp-btn" href="https://researchmap.jp/takuto_ando">researchmap</a>
      <a class="bp-btn" href="https://github.com/Takuto-Ando">GitHub</a>
    </div>
  </div>
</div>

<div class="bp-stats" markdown="0">
  <div class="bp-stat"><div class="bp-stat__n">3</div><div class="bp-stat__l">国際論文誌</div></div>
  <div class="bp-stat"><div class="bp-stat__n">10</div><div class="bp-stat__l">国際会議</div></div>
  <div class="bp-stat"><div class="bp-stat__n">7</div><div class="bp-stat__l">受賞</div></div>
  <div class="bp-stat"><div class="bp-stat__n">6</div><div class="bp-stat__l">国内発表</div></div>
</div>

<p class="bp-overview">
  GPUの電力効率問題に着目し、フォン・ノイマン・ボトルネックを構造的に排除した非ノイマン型アクセラレータ
  <strong>IMAX</strong> 上で LLM・Stable Diffusion・Whisper などの最先端AIアプリケーションを実装・最適化する研究を推進。
  ハードウェアとソフトウェアの協調設計によって持続可能な高性能AIコンピューティングの実現を追求している。
</p>

<div class="bp-awards" markdown="0">
  <div class="bp-awards__ttl">受賞歴</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Best Paper Award — ICISN 2026</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Best Paper Award — CANDAR 2025</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>Young Researcher Award — SASIMI 2025（IEEE CEDA All Japan Joint Chapter）</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>学生奨励賞 — 情報処理学会 第87回全国大会（2025）</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>奨励賞 優秀賞 — 日本高専学会（2025）</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>学生表彰 — 高専機構（2025）</div>
  <div class="bp-award"><span class="bp-award__mark">Award</span>学術奨励賞 — IEICE 九州支部（2025）</div>
</div>

<div class="bp-sec" markdown="0">ギャラリー</div>

<div class="bp-photo-grid" markdown="0">
  <img src="{{ '/assets/images/ICISN_1.jpg' | relative_url }}" alt="ICISN 2026">
  <img src="{{ '/assets/images/ICISN_2.PNG' | relative_url }}" alt="ICISN 2026">
  <img src="{{ '/assets/images/sasimi2025_photo.jpg' | relative_url }}" alt="SASIMI 2025">
  <img src="{{ '/assets/images/sasimi_presen.jpg' | relative_url }}" alt="SASIMI 発表">
  <img src="{{ '/assets/images/sasimi_award.jpg' | relative_url }}" alt="SASIMI 受賞">
  <img src="{{ '/assets/images/zenkoku2025.jpg' | relative_url }}" alt="情報処理学会 全国大会 2025">
</div>

<div class="bp-sec" markdown="0">NAIST での研究（2025年〜）</div>

<div class="bp-grid" markdown="0">
  <div class="bp-card" data-href="/research/llm/">
    <div class="bp-card__ttl">LLM の CGLA 上での高速化</div>
    <div class="bp-card__body">
      IMAX 上で Llama3・Qwen・Flan-T5 を実行し、ホスト側ボトルネックを解析。
      量子化対応の動的チャンキング手法 <strong>Q-snap</strong> を提案し、
      IMAX4 プロトタイプでサーバスケールの性能向上を実証した。
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
      <span class="bp-tag bp-tag--award">Young Researcher — SASIMI 2025</span>
      <span class="bp-tag">IEEE Access</span>
      <span class="bp-tag">SOCC 2025</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/generative-ai/">
    <div class="bp-card__ttl">生成 AI の CGLA 上での実装</div>
    <div class="bp-card__body">
      画像生成モデル <strong>Stable Diffusion</strong> を IMAX 上に実装。
      LLM 以外の多様な生成 AI ワークロードへの対応力と省エネルギー効果を実証した。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">MCSoC 2025</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/asr/">
    <div class="bp-card__ttl">音声認識（ASR）の高効率実装</div>
    <div class="bp-card__body">
      音声認識モデル <strong>Whisper</strong> を IMAX 上に実装し、独自の FP16 演算カーネルを開発。
      省電力推論を実現しながら CGLA の汎用性を実証した。
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
      <span class="bp-tag">arXiv:2511.02269</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/imax/">
    <div class="bp-card__ttl">IMAX アーキテクチャ</div>
    <div class="bp-card__body">
      演算ユニットとキャッシュメモリを交互配置した非ノイマン型 CGLA。
      CGRA の柔軟性とシストリックアレイの効率性を融合。
      エッジ向け <strong>IMAX3</strong>・サーバ向け <strong>IMAX4</strong> の評価・実装に貢献。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">CGRA / CGLA</span>
      <span class="bp-tag">ニアメモリコンピューティング</span>
      <span class="bp-tag">エッジ &amp; サーバ</span>
    </div>
  </div>
</div>

<div class="bp-sec" markdown="0">高専での研究（〜2025年）</div>

<div class="bp-grid" markdown="0">
  <div class="bp-card" data-href="/research/green-onion/">
    <div class="bp-card__ttl">コンピュータビジョン — 小ねぎ分岐部検出</div>
    <div class="bp-card__body">
      エッジデバイス上で YOLO・Mask-RCNN を活用した小ねぎ自動調製向け分岐部検出アルゴリズムを開発。
      古典的画像処理と深層学習の組み合わせで精度と軽量化を両立した。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">ICIC Express Letters 2026</span>
      <span class="bp-tag">農業情報研究 2024</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/facial-expression/">
    <div class="bp-card__ttl">FPGA / エッジ AI — 表情認識</div>
    <div class="bp-card__body">
      DPU ベースの DNN アクセラレータによる時分割マルチタスクで、
      FPGA 上のリアルタイム表情認識を実現。組み込み CPU 比で大幅な高フレームレート・省電力を達成。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">ICIC Express Letters 2025</span>
      <span class="bp-tag">CANDARW 2024</span>
    </div>
  </div>
</div>

{% endif %}
