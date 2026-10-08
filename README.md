# [GoogleSearchTest](https://github.com/Takuto-Ando/ando_profile)
Githubがgoogle探索に引っかかるようにテスト

## PoCのローカル確認

リポジトリ内で `bash scripts/preview-poc.sh` を実行し、`http://127.0.0.1:4000/poc/` を開く。
トップページにもローカル確認時だけPoCへのリンクが表示される。
停止はターミナルで `Ctrl+C`。
既存Gemfileの依存が必要で、`bundle` または `bundle3.2` を使用する。

24V DI / RS-485 / MSPM0 Peripheral Control / DRV8835のページは `published: false` の下書きで、通常のJekyll buildでは出力しない。
ローカルconfigで下書きを有効にし、analyticsを無効化する。
生成先は `_site-local/`、待受は `127.0.0.1` のみ。公開・push・deployは実行しない。
会話で共有された動作経験と、未整理の測定値・証拠を区別して記載している。
ログ・波形・回路図を照合してから結果欄を更新する。

## 技術/Technologyのローカル確認

同じ起動手順で `http://127.0.0.1:4000/research/` を開く。
ローカルconfigの `technical_preview: true` のとき、研究ページとナビ表示を技術ページへ切り替える。
Accelerator / Edge AI / Industrial PoC / Engineering Notesのカテゴリで既存研究とPoCをまとめる。
NTT / BitNet / SSM / DPDの新詳細は `published: false` で、通常buildの研究ページは従来の表示を維持する。
研究の整理範囲はMCSoC 2026 SSM・CANDARW 2026 BitNet/NTTまでの原稿と、それ以前の既存研究。
新詳細の公開前には論文の公開状況・公開許可を確認する。

デザイン候補は `/research/?design=notebook`（A ノート型）、`?design=index`（B 目次型）、`?design=gallery`（C 作品集型）。
ページ上部の「デザイン比較」を開いて切り替える。同じ内容と既存の配色を使用する。

現在の1列一覧を維持した見出し候補は `?design=hierarchy`（A 大きさで区別）、`?design=link-accent`（B 記事タイトルにアクセント）、`?design=section-band`（C カテゴリ帯）。
以前のレイアウト候補も各URLから確認できる。
採用デザインはC（カテゴリを帯で区別）で、queryなしの `/research/` でもCを表示する。
本文・タイトルは黒、通常リンクはターコイズ `#007C8C`、主なボタンは赤背景・白文字。
背景は白・薄いグレーを使い、薄い赤背景は使わない。配色は `assets/css/main.scss` のCSS変数で管理する。

各研究記事の添付資料は `_data/article_materials.yml` で管理する。
論文PDFは紹介文中のリンク、構成図は実装説明、評価図は結果説明に組み込む。画像クリックで原寸を開く。
元ファイルのパスとキャプションは同じYAMLに残す。
ローカルの研究11記事は `_data/technical_projects.yml` と共通テンプレートで執筆する。
旧研究7記事も新構成へ切り替え、元のMarkdown本文は通常buildの互換表示として残している。
新しい添付ファイルは `assets/portfolio-evidence/article-media/` に保存し、通常buildでは既存のexclude設定で出力しない。
`assets/portfolio-evidence/` はGit管理からも除外する。論文PDF・評価資料はローカルに保持し、pushに含めない。
NTT/BitNetの保存済みPDFは現行本文との版差を明記する。PoCの写真・回路図・ログは未特定のため代用品を添付しない。

# Minimal Mistakes remote theme starter

## ポートフォリオ資料庫（ローカル限定）

高専研究の入口は `http://127.0.0.1:4000/research/kosen/`。
本科卒論・専攻科特別研究論文、表情認識原稿、ねぎのYOLOX・Mask R-CNN・エッジ検出の資料を手法ごとに分ける。
既存の図/PDFを参照し、YOLOX継続原稿のみ `assets/portfolio-evidence/kosen-yolox-manuscript.pdf` にローカル添付する。
遮蔽画像/全体評価、2023年/2024年の評価条件を分け、原稿記載値を再測定として扱わない。

`http://127.0.0.1:4000/research/evidence/` に研究・個人PoCの出典と証拠整理状況をまとめる。
`_data/portfolio_evidence.yml` が台帳。Research_project相対パス、資料の種類、評価範囲、次に必要な証拠を記録する。
SSM Step-2 q64の2026-04-17過去集計から必要列を抽出したCSVを添付する。今回の再測定やモデル全体の性能として扱わない。
組込み4本は既存の本人申告ページを参照し、未発見のFirmware・回路図・生ログを添付済みとはしない。
CAN FD、EtherCAT、C2000、Linux、Functional Safety等は計画として分離する。
資料庫は `published: false`、`assets/portfolio-evidence` は通常configで除外し、ローカルconfigだけで添付を出力する。
原稿、コード、業務で取得したデータの公開可否は別途確認する。顧客・社内資料は収集しない。

Click [**Use this template**](https://github.com/mmistakes/mm-github-pages-starter/generate) button above for the quickest method of getting started with the [Minimal Mistakes Jekyll theme](https://github.com/mmistakes/minimal-mistakes).

Contains basic configuration to get you a site with:

- Sample posts.
- Sample top navigation.
- Sample author sidebar with social links.
- Sample footer links.
- Paginated home page.
- Archive pages for posts grouped by year, category, and tag.
- Sample about page.
- Sample 404 page.
- Site wide search.

Replace sample content with your own and [configure as necessary](https://mmistakes.github.io/minimal-mistakes/docs/configuration/).

---

## Troubleshooting

If you have a question about using Jekyll, start a discussion on the [Jekyll Forum](https://talk.jekyllrb.com/) or [StackOverflow](https://stackoverflow.com/questions/tagged/jekyll). Other resources:

- [Ruby 101](https://jekyllrb.com/docs/ruby-101/)
- [Setting up a Jekyll site with GitHub Pages](https://jekyllrb.com/docs/github-pages/)
- [Configuring GitHub Metadata](https://github.com/jekyll/github-metadata/blob/master/docs/configuration.md#configuration) to work properly when developing locally and avoid `No GitHub API authentication could be found. Some fields may be missing or have incorrect data.` warnings.
