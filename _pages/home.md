---
permalink: /
title: ""
lang: ja
locale: ja
classes: wide
author_profile: false
---

{% include lang-switcher.html %}
{% if site.local_poc_preview %}
<p class="preview-note"><strong>ローカル下書き：</strong> <a href="{{ '/research/' | relative_url }}">技術を見る</a> / <a href="{{ '/poc/' | relative_url }}">組込み・産業I/O PoC ポートフォリオを確認する</a></p>
{% endif %}
{% include home-v3.html %}
