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
    <h1 class="page-heading">Materials</h1>
  </header>
  <section id="slides">
    <h2 class="page-section-title">{% if is_en %}Slides{% else %}スライド{% endif %}</h2>
    {% for item in site.data.presentations.slides %}
    {% if is_en %}{% assign title = item.title_en %}{% else %}{% assign title = item.title_ja %}{% endif %}
    <article id="{{ item.id }}" class="material-slide">
      <div class="material-heading"><span>{{ item.label }}</span><h3>{{ title }}</h3></div>
      <div class="material-embed"><iframe src="https://speakerdeck.com/player/{{ item.deck }}" title="{{ title }}" loading="lazy" allowfullscreen></iframe></div>
      <a href="{{ item.href }}" target="_blank" rel="noopener">{% if is_en %}Open slides →{% else %}スライドを開く →{% endif %}</a>
      {% assign project = site.data.technical_projects.projects[item.primary_project] %}
      {% capture project_path %}/research/{{ item.primary_project }}/{% endcapture %}
      <p><a href="{{ project.href | default: project_path | relative_url }}">{% if is_en %}Read technical article →{% else %}技術記事を読む →{% endif %}</a></p>
    </article>
    {% endfor %}
  </section>
  <section id="pdf-slides">
    <h2 class="page-section-title">{% if is_en %}PDF Slides and Research Materials{% else %}PDFスライド・研究説明資料{% endif %}</h2>
    <p>{% if is_en %}Author-named saved materials, including manuscript-based versions and drafts. Publication here does not establish that every file was presented or is a final version.{% else %}本人名義を確認した保存資料を掲載しています。原稿に基づく説明版・草稿も含むため、各資料の版表示をご確認ください。すべてが実発表済み・最終版であることを意味しません。{% endif %}</p>
    <div class="material-posters">
      {% for item in site.data.presentations.pdf_slides %}
      {% if is_en %}{% assign title = item.title_en %}{% else %}{% assign title = item.title_ja %}{% endif %}
      <article id="{{ item.id }}" class="material-pdf">
        <div class="material-heading"><span>{{ item.label }}</span><h3>{{ title }}</h3></div>
        <a class="material-poster__image" href="{{ item.pdf | relative_url }}" target="_blank" rel="noopener"><img src="{{ item.image | relative_url }}" alt="{{ title | escape }} — PDF" loading="lazy"></a>
        <p class="poc-status">{% if is_en %}{{ item.version_en }}{% else %}{{ item.version_ja }}{% endif %} · {{ item.language }} · {{ item.pages }} {% if is_en %}pages{% else %}ページ{% endif %}</p>
        <p>{% if is_en %}{{ item.note_en }}{% else %}{{ item.note_ja }}{% endif %}</p>
        <a href="{{ item.pdf | relative_url }}" target="_blank" rel="noopener">{% if is_en %}Open PDF →{% else %}PDFを開く →{% endif %}</a>
        {% capture pdf_project_path %}/research/{{ item.primary_project }}/{% endcapture %}
        <p><a href="{{ pdf_project_path | relative_url }}">{% if is_en %}Read technical article →{% else %}技術記事を読む →{% endif %}</a></p>
      </article>
      {% endfor %}
    </div>
  </section>
  <section id="posters">
    <h2 class="page-section-title">{% if is_en %}Posters{% else %}ポスター{% endif %}</h2>
    <div class="material-posters">
      {% for item in site.data.presentations.posters %}
      {% if is_en %}{% assign title = item.title_en %}{% else %}{% assign title = item.title_ja %}{% endif %}
      <article id="{{ item.id }}" class="material-poster">
        <div class="material-heading"><span>{{ item.label }}</span><h3>{{ title }}</h3></div>
        {% if item.image %}<a class="material-poster__image" href="{{ item.image | relative_url }}" target="_blank" rel="noopener"><img src="{{ item.image | relative_url }}" alt="{{ title }} — {{ item.label }}" loading="lazy"></a>
        <a href="{{ item.image | relative_url }}" target="_blank" rel="noopener">{% if is_en %}View full size →{% else %}原寸で見る →{% endif %}</a>{% endif %}
        <p>{% if is_en %}{{ item.note_en }}{% else %}{{ item.note_ja }}{% endif %}</p>
        {% if item.pdf %}<a href="{{ item.pdf | relative_url }}" target="_blank" rel="noopener">{% if is_en %}Poster PDF →{% else %}ポスターPDF →{% endif %}</a>{% endif %}
        {% if item.pptx %}<a href="{{ item.pptx | relative_url }}">{% if is_en %}Poster PPTX →{% else %}ポスターPPTX →{% endif %}</a>{% endif %}
        {% assign poster_project_key = item.projects | first %}
        {% capture poster_project_path %}/research/{{ poster_project_key }}/{% endcapture %}
        <p><a href="{{ poster_project_path | relative_url }}">{% if is_en %}Read technical article →{% else %}技術記事を読む →{% endif %}</a></p>
      </article>
      {% endfor %}
    </div>
  </section>
</div>
