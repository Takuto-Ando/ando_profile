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
<p class="preview-note"><strong>ローカル下書き：</strong> <a href="{{ '/research/' | relative_url }}">技術を見る</a></p>
<p class="preview-note"><a href="{{ '/career/ti-digital-fae/' | relative_url }}">Takuto AndoのTI Digital FAE 報酬・キャリア戦略</a></p>
<p class="preview-note"><a href="http://127.0.0.1:4178/">FAE Design Win Simulatorを開く（ローカル学習アプリ）</a> — 別途Simulatorの起動が必要です。</p>
{% endif %}
{% include home-v3.html %}
