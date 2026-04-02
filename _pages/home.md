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
    <div class="bp-profile__en">Master's Student · Computing Architecture Lab · NAIST</div>
    <div class="bp-profile__aff">Researcher / Engineer for Sustainable AI Systems</div>
    <div class="bp-profile__bio">
      I work on hardware/software co-design for AI acceleration, with a focus on making modern AI systems
      practical under strict power and data-movement constraints. My core work is implementing
      <strong>LLMs</strong>, <strong>speech recognition</strong>, and <strong>image generation</strong> on the
      non-von Neumann CGLA accelerator <strong>IMAX</strong>, then identifying the real system bottlenecks
      across kernels, DMA, and host runtime.
    </div>
    <div class="bp-profile__btns">
      <a class="bp-btn" href="https://researchmap.jp/takuto_ando">researchmap</a>
      <a class="bp-btn" href="https://github.com/Takuto-Ando">GitHub</a>
      <a class="bp-btn" href="{{ '/publications/' | relative_url }}">Publications</a>
      <a class="bp-btn" href="{{ '/presentations/' | relative_url }}">Slides</a>
    </div>
  </div>
</div>

<div class="bp-stats" markdown="0">
  <div class="bp-stat"><div class="bp-stat__n">5</div><div class="bp-stat__l">Lead Papers</div></div>
  <div class="bp-stat"><div class="bp-stat__n">3</div><div class="bp-stat__l">AI Domains</div></div>
  <div class="bp-stat"><div class="bp-stat__n">7</div><div class="bp-stat__l">Awards</div></div>
  <div class="bp-stat"><div class="bp-stat__n">2</div><div class="bp-stat__l">IMAX Generations</div></div>
</div>

<p class="bp-overview">
  My current research theme is not just "running AI on a new accelerator," but
  <strong>finding which part of the stack actually limits end-to-end efficiency</strong> and redesigning it.
  This means kernel mapping, host-side scheduling, quantization-aware chunking, DMA optimization,
  and platform migration from edge-oriented <strong>IMAX3</strong> to server-oriented <strong>IMAX4</strong>.
</p>

<div class="bp-link-grid" markdown="0">
  <a class="bp-link-card" href="{{ '/research/llm/' | relative_url }}">
    <span class="bp-link-card__kicker">Research Highlight</span>
    <strong>LLM on IMAX</strong>
    <span>Kernel mapping, Q-Snap, IMAX4 bottleneck analysis</span>
  </a>
  <a class="bp-link-card" href="{{ '/publications/' | relative_url }}">
    <span class="bp-link-card__kicker">Academic Record</span>
    <strong>Publications</strong>
    <span>Peer-reviewed papers, awards, and PDF links</span>
  </a>
  <a class="bp-link-card" href="{{ '/presentations/' | relative_url }}">
    <span class="bp-link-card__kicker">Materials</span>
    <strong>Slides & Posters</strong>
    <span>Speaker Deck embeds and presentation visuals</span>
  </a>
  <a class="bp-link-card" href="{{ '/biography/' | relative_url }}">
    <span class="bp-link-card__kicker">Background</span>
    <strong>Biography</strong>
    <span>Education, work experience, awards, and qualifications</span>
  </a>
</div>

<div class="bp-sec" markdown="0">Selected Impact</div>

<div class="bp-metric-grid" markdown="0">
  <div class="bp-metric">
    <div class="bp-metric__value">44.4×</div>
    <div class="bp-metric__title">PDP Improvement</div>
    <p>IEEE Access 2025: IMAX 28nm projection vs RTX 4090 for Qwen-family LLM inference.</p>
  </div>
  <div class="bp-metric">
    <div class="bp-metric__value">1.62×</div>
    <div class="bp-metric__title">Prefill Speedup</div>
    <p>Q-Snap improved prefill throughput from 17.11 to 27.70 tok/s by changing chunking policy.</p>
  </div>
  <div class="bp-metric">
    <div class="bp-metric__value">260×</div>
    <div class="bp-metric__title">Host Overhead Reduction</div>
    <p>SASIMI 2025: host processing time dropped after migrating from IMAX3 to IMAX4.</p>
  </div>
  <div class="bp-metric">
    <div class="bp-metric__value">10.48×</div>
    <div class="bp-metric__title">ASR Energy Efficiency</div>
    <p>Wiley CCPE extension: Whisper tiny.en achieved 10.48x PDP improvement vs RTX 4090.</p>
  </div>
</div>

<div class="bp-sec" markdown="0">What I Solve</div>

<div class="bp-text-grid" markdown="0">
  <div class="bp-panel">
    <div class="bp-panel__title">1. System Bottlenecks Hidden Behind Good Kernels</div>
    <p>Even when compute kernels are efficient, end-to-end latency is often dominated by host CPU work, transfer paths, and runtime policy. I focus on identifying those hidden costs and making them measurable.</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">2. Extending One Architecture Across Multiple AI Domains</div>
    <p>I study whether a general-purpose CGLA can cover text, speech, and image generation without becoming a narrow single-workload accelerator.</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">3. Turning Research Prototypes into Reusable Software</div>
    <p>My implementation work aims at reusable kernels, workload chunking logic, and a software stack that can support multiple applications rather than one-off experiments.</p>
  </div>
</div>

<div class="bp-sec" markdown="0">Research Portfolio</div>

<div class="bp-grid" markdown="0">
  <div class="bp-card" data-href="/research/llm/">
    <div class="bp-card__ttl">LLM Acceleration on CGLA</div>
    <div class="bp-card__body">
      Implemented Qwen, Llama3, and Flan-T5 related workloads on IMAX. This line of work led to
      IEEE Access 2025, SASIMI 2025, SOCC 2025, and the Q-Snap paper at ICISN 2026.
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
      <span class="bp-tag bp-tag--award">Young Researcher — SASIMI 2025</span>
      <span class="bp-tag">IEEE Access</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/asr/">
    <div class="bp-card__ttl">Whisper ASR on CGLA</div>
    <div class="bp-card__body">
      Built custom FP16 kernels and evaluated hybrid execution for speech recognition. The work established
      that IMAX can deliver strong energy efficiency outside LLM workloads as well.
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
      <span class="bp-tag">Wiley CCPE</span>
      <span class="bp-tag">Whisper tiny/base/small</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/generative-ai/">
    <div class="bp-card__ttl">Stable Diffusion on CGLA</div>
    <div class="bp-card__body">
      Reused low-bit kernels from LLM research to evaluate image generation on IMAX, clarifying where
      FP16 and FP32 support still limits full offloading.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">MCSoC 2025</span>
      <span class="bp-tag">Stable Diffusion</span>
      <span class="bp-tag">Cross-domain validation</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/imax/">
    <div class="bp-card__ttl">IMAX Architecture and Platform Evolution</div>
    <div class="bp-card__body">
      Worked on both edge-oriented IMAX3 and server-oriented IMAX4 evaluation, with emphasis on
      how host infrastructure changes the practical value of the accelerator.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">CGRA / CGLA</span>
      <span class="bp-tag">Near-Memory Computing</span>
      <span class="bp-tag">IMAX3 / IMAX4</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/green-onion/">
    <div class="bp-card__ttl">Computer Vision for Agriculture</div>
    <div class="bp-card__body">
      Developed edge-device branching point detection for automated green onion trimming using
      classical vision and deep learning methods.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">Agricultural Information Research 2024</span>
      <span class="bp-tag">YOLO / Mask-RCNN</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/facial-expression/">
    <div class="bp-card__ttl">FPGA Edge AI for Facial Expression Recognition</div>
    <div class="bp-card__body">
      Implemented DPU-based multi-tasking inference on FPGA and validated real-time facial expression
      recognition under constrained hardware resources.
    </div>
    <div class="bp-tags">
      <span class="bp-tag">ICIC Express Letters 2025</span>
      <span class="bp-tag">CANDARW 2024</span>
      <span class="bp-tag">FPGA</span>
    </div>
  </div>
</div>

<div class="bp-sec" markdown="0">Engineering Style</div>

<div class="bp-text-grid" markdown="0">
  <div class="bp-panel">
    <div class="bp-panel__title">Evidence-Driven Development</div>
    <p>I prefer claims backed by runtime breakdowns, energy metrics, and cross-platform comparisons rather than architecture slogans.</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">Full-Stack Research Implementation</div>
    <p>My work spans algorithms, accelerator kernels, runtime design, platform evaluation, papers, posters, and reproducible artifacts.</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">Bilingual Communication</div>
    <p>I maintain both Japanese and English presentation materials so the same work can be shared in domestic and international contexts.</p>
  </div>
</div>

<div class="bp-sec" markdown="0">Recent Milestones</div>

<div class="bp-timeline" markdown="0">
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2026.03</div>
    <div class="bp-timeline__body">
      <strong>ICISN 2026 Best Paper Award</strong><br>
      Q-Snap: quantization-aware dynamic chunking for LLM execution on CGLA.
    </div>
  </div>
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2025.11</div>
    <div class="bp-timeline__body">
      <strong>CANDAR 2025 Best Paper Award</strong><br>
      Whisper ASR acceleration on IMAX.
    </div>
  </div>
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2025.10</div>
    <div class="bp-timeline__body">
      <strong>SASIMI 2025 Young Researcher Award</strong><br>
      Detailed LLM bottleneck analysis on IMAX3 and IMAX4.
    </div>
  </div>
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2025</div>
    <div class="bp-timeline__body">
      <strong>IEEE Access / SOCC / MCSoC</strong><br>
      Expanded the portfolio from LLMs to speech and image generation.
    </div>
  </div>
</div>

<div class="bp-sec" markdown="0">Personal Side</div>

<div class="bp-note">
  Outside research, I enjoy strength training, swimming, baseball, and anime/drama.
  I value portfolios that show not only technical output but also continuity, curiosity,
  and how a person works with others over time.
</div>

<div class="bp-sec" markdown="0">Gallery</div>

<div class="bp-photo-grid" markdown="0">
  <img src="{{ '/assets/images/ICISN_1.jpg' | relative_url }}" alt="ICISN 2026">
  <img src="{{ '/assets/images/ICISN_2.PNG' | relative_url }}" alt="ICISN 2026">
  <img src="{{ '/assets/images/sasimi2025_photo.jpg' | relative_url }}" alt="SASIMI 2025">
  <img src="{{ '/assets/images/sasimi_presen.jpg' | relative_url }}" alt="SASIMI presentation">
  <img src="{{ '/assets/images/sasimi_award.jpg' | relative_url }}" alt="SASIMI award">
  <img src="{{ '/assets/images/zenkoku2025.jpg' | relative_url }}" alt="IPSJ 2025">
</div>

{% else %}

<div class="bp-profile" markdown="0">
  <img class="bp-profile__img" src="{{ '/assets/images/ando2.png' | relative_url }}" alt="安藤 拓翔" onerror="this.style.background='#f1f5f9'">
  <div>
    <div class="bp-profile__name">安藤 拓翔 <span style="font-size:1rem;font-weight:400;color:#94A3B8">Takuto ANDO</span></div>
    <div class="bp-profile__en">博士前期課程 · コンピューティング・アーキテクチャ研究室 · NAIST</div>
    <div class="bp-profile__aff">持続可能な AI システムを研究する Researcher / Engineer</div>
    <div class="bp-profile__bio">
      AI アクセラレーションを、単なるカーネル高速化ではなく
      <strong>システム全体の電力効率とデータ移動の最適化</strong>として捉えて研究しています。
      非ノイマン型 CGLA アクセラレータ <strong>IMAX</strong> 上で
      <strong>LLM</strong>、<strong>音声認識</strong>、<strong>画像生成</strong>を実装し、
      カーネル・DMA・ホストランタイムをまたいで実効性能のボトルネックを解析しています。
    </div>
    <div class="bp-profile__btns">
      <a class="bp-btn" href="https://researchmap.jp/takuto_ando">researchmap</a>
      <a class="bp-btn" href="https://github.com/Takuto-Ando">GitHub</a>
      <a class="bp-btn" href="{{ '/publications/' | relative_url }}">研究業績</a>
      <a class="bp-btn" href="{{ '/presentations/' | relative_url }}">発表資料</a>
    </div>
  </div>
</div>

<div class="bp-stats" markdown="0">
  <div class="bp-stat"><div class="bp-stat__n">5</div><div class="bp-stat__l">筆頭主要論文</div></div>
  <div class="bp-stat"><div class="bp-stat__n">3</div><div class="bp-stat__l">AI ドメイン</div></div>
  <div class="bp-stat"><div class="bp-stat__n">7</div><div class="bp-stat__l">受賞</div></div>
  <div class="bp-stat"><div class="bp-stat__n">2</div><div class="bp-stat__l">IMAX 世代</div></div>
</div>

<p class="bp-overview">
  現在の研究テーマは、単に「新しいアクセラレータで AI を動かすこと」ではなく、
  <strong>どこが end-to-end の効率を本当に制限しているのかを特定し、そこを設計し直すこと</strong>です。
  そのために、カーネルマッピング、ホスト側スケジューリング、量子化対応チャンキング、
  DMA 最適化、そしてエッジ向け <strong>IMAX3</strong> からサーバ向け <strong>IMAX4</strong> への移行評価まで扱っています。
</p>

<div class="bp-link-grid" markdown="0">
  <a class="bp-link-card" href="{{ '/research/llm/' | relative_url }}">
    <span class="bp-link-card__kicker">研究ハイライト</span>
    <strong>LLM on IMAX</strong>
    <span>Kernel mapping、Q-Snap、IMAX4 ボトルネック解析</span>
  </a>
  <a class="bp-link-card" href="{{ '/publications/' | relative_url }}">
    <span class="bp-link-card__kicker">研究業績</span>
    <strong>Publications</strong>
    <span>査読付き論文、受賞、PDF への導線</span>
  </a>
  <a class="bp-link-card" href="{{ '/presentations/' | relative_url }}">
    <span class="bp-link-card__kicker">資料</span>
    <strong>Slides & Posters</strong>
    <span>Speaker Deck とポスター資料</span>
  </a>
  <a class="bp-link-card" href="{{ '/biography/' | relative_url }}">
    <span class="bp-link-card__kicker">経歴</span>
    <strong>Biography</strong>
    <span>学歴、職歴、受賞、資格</span>
  </a>
</div>

<div class="bp-sec" markdown="0">主要インパクト</div>

<div class="bp-metric-grid" markdown="0">
  <div class="bp-metric">
    <div class="bp-metric__value">44.4×</div>
    <div class="bp-metric__title">PDP 改善</div>
    <p>IEEE Access 2025: Qwen 系 LLM 推論で IMAX 28nm 見積が RTX 4090 比 44.4 倍の PDP 改善。</p>
  </div>
  <div class="bp-metric">
    <div class="bp-metric__value">1.62×</div>
    <div class="bp-metric__title">Prefill 高速化</div>
    <p>Q-Snap により chunking policy を見直し、17.11 から 27.70 tok/s まで改善。</p>
  </div>
  <div class="bp-metric">
    <div class="bp-metric__value">260×</div>
    <div class="bp-metric__title">ホスト処理削減</div>
    <p>SASIMI 2025: IMAX3 から IMAX4 への移行でホスト処理時間を大幅に短縮。</p>
  </div>
  <div class="bp-metric">
    <div class="bp-metric__value">10.48×</div>
    <div class="bp-metric__title">ASR 電力効率</div>
    <p>Wiley CCPE 拡張版で Whisper tiny.en が RTX 4090 比 10.48 倍の PDP 改善。</p>
  </div>
</div>

<div class="bp-sec" markdown="0">何を解いているか</div>

<div class="bp-text-grid" markdown="0">
  <div class="bp-panel">
    <div class="bp-panel__title">1. 良いカーネルの裏に隠れるシステムボトルネック</div>
    <p>計算カーネルが速くても、end-to-end レイテンシはホスト CPU、転送経路、実行ポリシーで支配されます。そこを可視化し、測定可能にすることを重視しています。</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">2. 一つのアーキテクチャを複数 AI ドメインへ拡張すること</div>
    <p>単一用途アクセラレータではなく、CGLA がテキスト・音声・画像生成にまたがって成立するかを実装ベースで検証しています。</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">3. 研究試作を再利用可能なソフトウェアへ変えること</div>
    <p>個別実験で終わらせず、カーネル、chunking ロジック、テレメトリ、統合ソフトウェアスタックへつなげることを目指しています。</p>
  </div>
</div>

<div class="bp-sec" markdown="0">Research Portfolio</div>

<div class="bp-grid" markdown="0">
  <div class="bp-card" data-href="/research/llm/">
    <div class="bp-card__ttl">LLM の CGLA 上での高速化</div>
    <div class="bp-card__body">
      Qwen、Llama3、Flan-T5 関連ワークロードを IMAX 上で実装。
      IEEE Access 2025、SASIMI 2025、SOCC 2025、ICISN 2026 につながった主軸テーマです。
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — ICISN 2026</span>
      <span class="bp-tag bp-tag--award">Young Researcher — SASIMI 2025</span>
      <span class="bp-tag">IEEE Access</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/asr/">
    <div class="bp-card__ttl">Whisper ASR の CGLA 実装</div>
    <div class="bp-card__body">
      独自 FP16 カーネルと混合実行戦略を構築し、音声認識でも IMAX の電力効率優位を示しました。
      LLM 以外へ拡張できることを示す重要な研究です。
    </div>
    <div class="bp-tags">
      <span class="bp-tag bp-tag--award">Best Paper — CANDAR 2025</span>
      <span class="bp-tag">Wiley CCPE</span>
      <span class="bp-tag">Whisper tiny/base/small</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/generative-ai/">
    <div class="bp-card__ttl">Stable Diffusion の CGLA 実装</div>
    <div class="bp-card__body">
      LLM 向け低ビットカーネルを画像生成へ再利用し、IMAX のクロスドメイン適用可能性を検証。
      同時に F16/F32 オフロードの課題も明確化しました。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">MCSoC 2025</span>
      <span class="bp-tag">Stable Diffusion</span>
      <span class="bp-tag">Cross-domain validation</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/imax/">
    <div class="bp-card__ttl">IMAX アーキテクチャとプラットフォーム進化</div>
    <div class="bp-card__body">
      エッジ向け IMAX3 とサーバ向け IMAX4 の双方を評価し、アクセラレータ自体だけでなく
      ホストインフラが実効価値をどう変えるかを検証しています。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">CGRA / CGLA</span>
      <span class="bp-tag">Near-Memory Computing</span>
      <span class="bp-tag">IMAX3 / IMAX4</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/green-onion/">
    <div class="bp-card__ttl">農業向けコンピュータビジョン</div>
    <div class="bp-card__body">
      小ねぎ自動調製のための分岐部検出を、古典的画像処理と深層学習の組み合わせで実装。
      エッジデバイス展開を意識した軽量化も扱いました。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">農業情報研究 2024</span>
      <span class="bp-tag">YOLO / Mask-RCNN</span>
    </div>
  </div>
  <div class="bp-card" data-href="/research/facial-expression/">
    <div class="bp-card__ttl">FPGA Edge AI による表情認識</div>
    <div class="bp-card__body">
      DPU ベースのマルチタスク推論を FPGA 上に実装し、制約の強いハードウェア環境での
      リアルタイム表情認識を検証しました。
    </div>
    <div class="bp-tags">
      <span class="bp-tag">ICIC Express Letters 2025</span>
      <span class="bp-tag">CANDARW 2024</span>
      <span class="bp-tag">FPGA</span>
    </div>
  </div>
</div>

<div class="bp-sec" markdown="0">Engineering Style</div>

<div class="bp-text-grid" markdown="0">
  <div class="bp-panel">
    <div class="bp-panel__title">Evidence-Driven Development</div>
    <p>アーキテクチャの見栄えよりも、runtime breakdown、エネルギー指標、クロスプラットフォーム比較を重視します。</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">Full-Stack Research Implementation</div>
    <p>アルゴリズム、アクセラレータカーネル、ランタイム設計、評価、論文、ポスターまで一気通貫で扱います。</p>
  </div>
  <div class="bp-panel">
    <div class="bp-panel__title">Bilingual Communication</div>
    <p>国内外の発表や共同研究を意識して、日本語と英語の両方で資料と説明を整えています。</p>
  </div>
</div>

<div class="bp-sec" markdown="0">Recent Milestones</div>

<div class="bp-timeline" markdown="0">
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2026.03</div>
    <div class="bp-timeline__body">
      <strong>ICISN 2026 Best Paper Award</strong><br>
      Q-Snap: 量子化対応の動的チャンキングによる LLM 実行最適化。
    </div>
  </div>
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2025.11</div>
    <div class="bp-timeline__body">
      <strong>CANDAR 2025 Best Paper Award</strong><br>
      Whisper ASR の IMAX 実装と電力効率評価。
    </div>
  </div>
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2025.10</div>
    <div class="bp-timeline__body">
      <strong>SASIMI 2025 Young Researcher Award</strong><br>
      IMAX3 / IMAX4 における LLM 実行ボトルネックの詳細分析。
    </div>
  </div>
  <div class="bp-timeline__item">
    <div class="bp-timeline__date">2025</div>
    <div class="bp-timeline__body">
      <strong>IEEE Access / SOCC / MCSoC</strong><br>
      LLM に加えて音声認識・画像生成へ研究領域を拡張。
    </div>
  </div>
</div>

<div class="bp-sec" markdown="0">Personal Side</div>

<div class="bp-note">
  研究以外では、筋トレ、水泳、野球観戦、アニメ・ドラマ鑑賞が好きです。
  ポートフォリオは実績の一覧だけでなく、継続性や好奇心、周囲とどう仕事を進めるかが伝わることも重要だと考えています。
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

{% endif %}
