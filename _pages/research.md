---
permalink: /research/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

<div class="pub-page" markdown="0">
  <div class="pub-page__hero">
    <p class="pub-page__eyebrow">Research Themes</p>
    <h1 class="pub-page__title">Research Themes</h1>
    <p class="pub-page__lead">
      This page summarizes my research themes from recent CGLA and IMAX work to earlier edge-AI and FPGA projects.
    </p>
    <p class="pub-page__note">Ordered from recent themes to earlier work.</p>
  </div>

  <div class="bp-grid">
    {% for item in site.data.home_research %}
      <div class="bp-card" data-href="{{ item.href | relative_url }}">
        <div class="bp-card__media">
          <img src="{{ item.image | relative_url }}" alt="{{ item.title_en }}">
        </div>
        <div class="bp-card__media-caption">{{ item.caption_en }}</div>
        <div class="bp-card__ttl">{{ item.title_en }}</div>
        <div class="bp-card__body">{{ item.body_en }}</div>
        <div class="bp-tags">
          {% for tag in item.tags %}
            <span class="bp-tag{% if tag.kind == 'award' %} bp-tag--award{% endif %}">{{ tag.label }}</span>
          {% endfor %}
        </div>
      </div>
    {% endfor %}
  </div>
</div>

{% else %}

<div class="pub-page" markdown="0">
  <div class="pub-page__hero">
    <p class="pub-page__eyebrow">Research Themes</p>
    <h1 class="pub-page__title">研究テーマ</h1>
    <p class="pub-page__lead">
      現在進めている CGLA / IMAX 研究から、高専時代に取り組んだエッジ AI・FPGA 実装まで、主な研究テーマをまとめています。
    </p>
    <p class="pub-page__note">新しいテーマから順に掲載しています。</p>
  </div>

  <div class="bp-grid">
    {% for item in site.data.home_research %}
      <div class="bp-card" data-href="{{ item.href | relative_url }}">
        <div class="bp-card__media">
          <img src="{{ item.image | relative_url }}" alt="{{ item.title_ja }}">
        </div>
        <div class="bp-card__media-caption">{{ item.caption_ja }}</div>
        <div class="bp-card__ttl">{{ item.title_ja }}</div>
        <div class="bp-card__body">{{ item.body_ja }}</div>
        <div class="bp-tags">
          {% for tag in item.tags %}
            <span class="bp-tag{% if tag.kind == 'award' %} bp-tag--award{% endif %}">{{ tag.label }}</span>
          {% endfor %}
        </div>
      </div>
    {% endfor %}
  </div>
</div>

{% endif %}
