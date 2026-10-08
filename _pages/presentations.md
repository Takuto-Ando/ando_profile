---
permalink: /presentations/
classes: wide
author_profile: false
---

{% include lang-switcher.html %}
{% assign is_en = false %}
{% if site.active_lang == 'en' %}{% assign is_en = true %}{% endif %}
<div class="materials-page" markdown="0">
  <header class="page-intro">
    <h1 class="page-heading">{% if is_en %}Presentation Materials{% else %}発表資料{% endif %}</h1>
    <p>{% if is_en %}Slides and posters on accelerator evaluation and FPGA / image processing research.{% else %}アクセラレータの評価と、FPGA・画像処理研究のスライドとポスターをまとめています。{% endif %}</p>
    <nav class="page-links" aria-label="{% if is_en %}Material types{% else %}資料の種類{% endif %}">
      <a href="#slides">{% if is_en %}Slides{% else %}スライド{% endif %}</a>
      <a href="#posters">{% if is_en %}Posters{% else %}ポスター{% endif %}</a>
      <a href="{{ '/publications/' | relative_url }}">{% if is_en %}Publications →{% else %}研究業績 →{% endif %}</a>
    </nav>
  </header>
  <section id="slides">
    <h2 class="page-section-title">{% if is_en %}Slides{% else %}スライド{% endif %}</h2>
    {% for item in site.data.presentations.slides %}
    {% if is_en %}{% assign title = item.title_en %}{% else %}{% assign title = item.title_ja %}{% endif %}
    <article class="material-slide">
      <div class="material-heading"><span>{{ item.label }}</span><h3>{{ title }}</h3></div>
      <div class="material-embed"><iframe src="https://speakerdeck.com/player/{{ item.deck }}" title="{{ title }}" loading="lazy" allowfullscreen></iframe></div>
      <a href="https://speakerdeck.com/player/{{ item.deck }}" target="_blank" rel="noopener">{% if is_en %}Open slides →{% else %}スライドを開く →{% endif %}</a>
    </article>
    {% endfor %}
  </section>
  <section id="posters">
    <h2 class="page-section-title">{% if is_en %}Posters{% else %}ポスター{% endif %}</h2>
    <div class="material-posters">
      {% for item in site.data.presentations.posters %}
      {% if is_en %}{% assign title = item.title_en %}{% else %}{% assign title = item.title_ja %}{% endif %}
      <article class="material-poster">
        <div class="material-heading"><span>{{ item.label }}</span><h3>{{ title }}</h3></div>
        <a class="material-poster__image" href="{{ item.image | relative_url }}" target="_blank" rel="noopener"><img src="{{ item.image | relative_url }}" alt="{{ title }} — {{ item.label }}" loading="lazy"></a>
        <a href="{{ item.image | relative_url }}" target="_blank" rel="noopener">{% if is_en %}View full size →{% else %}原寸で見る →{% endif %}</a>
      </article>
      {% endfor %}
    </div>
  </section>
</div>
