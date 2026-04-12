---
permalink: /about/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

<div class="about-page" markdown="0">
  <div class="about-card">
    <div class="about-card__photo">
      <img src="{{ '/assets/images/ando2.png' | relative_url }}" alt="Takuto Ando">
    </div>
    <div class="about-card__body">
      <p class="about-card__eyebrow">About</p>
      <h1 class="about-card__name">Takuto Ando</h1>
      <p class="about-card__role">Master's Student, Computing Architecture Laboratory, NAIST</p>
      <p class="about-card__text">
        I study computer architecture and AI systems at NAIST, with a focus on implementing practical AI workloads on energy-efficient accelerators. My work spans research design, software implementation, performance analysis, and presentation.
      </p>
      <p class="about-card__text">
        I am particularly interested in how hardware and software should be designed together so that AI systems remain both efficient and usable. In addition to current work on IMAX and CGLA-based acceleration, I also value experience gained from FPGA implementation and edge-AI projects during my college years.
      </p>
      <p class="about-card__text">
        This site is intended to give a concise overview of who I am, what I work on, and how I approach research and implementation.
      </p>
    </div>
  </div>
</div>

{% else %}

<div class="about-page" markdown="0">
  <div class="about-card">
    <div class="about-card__photo">
      <img src="{{ '/assets/images/ando2.png' | relative_url }}" alt="安藤 拓翔">
    </div>
    <div class="about-card__body">
      <p class="about-card__eyebrow">About</p>
      <h1 class="about-card__name">安藤 拓翔</h1>
      <p class="about-card__role">奈良先端科学技術大学院大学 博士前期課程 / コンピューティング・アーキテクチャ研究室</p>
      <p class="about-card__text">
        奈良先端大で計算機アーキテクチャと AI システムを研究しています。実際に動く AI ワークロードを対象に、アクセラレータ上での実装、性能解析、システム評価まで一貫して取り組むことを大切にしています。
      </p>
      <p class="about-card__text">
        関心があるのは、ハードウェアとソフトウェアを別々に最適化するのではなく、全体としてどう設計すれば効率的で使いやすい計算基盤になるかという点です。現在は IMAX や CGLA を用いた研究を進めつつ、高専時代に取り組んだ FPGA 実装やエッジ AI の経験も研究の土台になっています。
      </p>
      <p class="about-card__text">
        このページでは、研究者・実装者としての全体像が自然に伝わるように、自分の関心や取り組み方を簡潔にまとめています。
      </p>
    </div>
  </div>
</div>

{% endif %}
