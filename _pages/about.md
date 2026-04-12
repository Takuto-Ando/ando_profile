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
        At NAIST, I am working on "building an energy-efficient AI computing infrastructure using next-generation AI accelerators." As AI models grow increasingly massive, the power consumption of data centers has become a significant social issue. While existing GPUs offer high performance, they suffer from a structural challenge known as the "von Neumann bottleneck," where the energy required to move data from memory exceeds the energy used for the computation itself. To address this, I focused on a unique architecture called CGLA, which integrates memory and arithmetic units in close proximity. The core of my research lies not simply in using new hardware, but in developing custom software that fully exploits its physical characteristics. Specifically, when implementing state-of-the-art models like Llama and speech recognition models, I employ "Hardware/Software Co-design"—partitioning data according to hardware memory capacity and bandwidth, and streaming it to keep the computational pipeline from stalling.
      </p>
      <p class="about-card__text">
        Currently, my main focus is developing applications designed to run on future computers. Ultimately, I hope to leverage the experience gained through my research to become an engineer capable of solving fundamental problems, serving as a bridge between technology and society.
      </p>
    </div>
  </div>
</div>

{% else %}

<div class="about-page" markdown="0">
  <div class="about-card">
    <div class="about-card__photo">
      <img src="{{ '/assets/images/ando_main.jpg' | relative_url }}" alt="安藤 拓翔">
    </div>
    <div class="about-card__body">
      <p class="about-card__eyebrow">About</p>
      <h1 class="about-card__name">安藤 拓翔</h1>
      <p class="about-card__role">奈良先端科学技術大学院大学 博士前期課程2年 / コンピューティング・アーキテクチャ研究室</p>
      <p class="about-card__text">
        奈良先端大で『次世代AIアクセラレータによる、省電力なAI計算基盤の構築』に取り組んでいます。現在、AIのモデルは巨大化し、データセンターの消費電力が社会問題になっています。 既存のGPUは高性能ですが、『フォン・ノイマン・ボトルネック』と呼ばれる構造上の課題があり、メモリからデータを読み出す移動エネルギーが、計算そのもののエネルギーよりも大きくなっています。そこで私は、メモリと演算器を一体化に近い形で配置したCGLAという独自アーキテクチャに着目しました。私の研究の核心は、単に新しいハードを使うだけでなく、『ハードウェアの物理的な特徴を活かし切るソフトウェア』を自作した点にあります。具体的には、Llamaなどの最新のLLMや音声認識モデルを実装する際、ハードウェアのメモリ容量や帯域に合わせてデータを分割し、パイプラインが止まらないようにデータを流し込む『HW/SW協調設計』を行いました。
      </p>
      <p class="about-card__text">
        現在は未来のコンピュータで動くアプリケーション開発を主に行っています。将来的にはこの研究での経験を活かして、実社会と技術のインターフェースとなるような本質的な問題解決ができるエンジニアになりたいです。
      </p>
    </div>
  </div>
</div>

{% endif %}
