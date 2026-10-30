---
permalink: /research/
classes: wide
---

{% include lang-switcher.html %}

{% if site.technical_preview or site.technical_enabled %}
{% include technical-hub.html %}
{% else %}
{% if site.active_lang == 'en' %}

<div class="pub-page" markdown="0">
  <div class="pub-page__hero">
    <h1 class="page-heading">Technology</h1>
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
      </div>
    {% endfor %}
  </div>
</div>

{% else %}

<div class="pub-page" markdown="0">
  <div class="pub-page__hero">
    <h1 class="page-heading">Technology</h1>
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
      </div>
    {% endfor %}
  </div>
</div>

{% endif %}
{% endif %}
