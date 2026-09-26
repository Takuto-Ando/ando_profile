# Ando Takuto Research Portfolio

Jekyll と Minimal Mistakes で構成した静的ポートフォリオサイトです。
Cloudflare Pages では `https://takuto-portfolio.pages.dev` で公開します。

## 構成

- Framework: Jekyll 4
- Theme: Minimal Mistakes
- Build command: `bundle exec jekyll build`
- Build output directory: `_site`
- Node.js / `package.json`: 使用しない
- サーバーサイド機能・環境変数: 使用しない

Jekyll が各ページを静的 HTML として生成するため、SPA 用フォールバック設定は不要です。
各ページへの直接アクセスも `_site` 内の実ファイルで処理されます。

## ローカル確認

Ruby 3.2.3 と Bundler を準備してから、次を実行します。

```bash
bundle install
bundle exec jekyll build
bundle exec jekyll serve
```

`bundle exec jekyll build` が成功すると、公開用ファイルは `_site/` に生成されます。
`_site/`、`vendor/`、`.bundle/`、`.env`、`node_modules/` は Git にコミットしません。

## Cloudflare Pages への初回公開

1. GitHub 上でこのリポジトリの公開用ブランチを `main` にします。既存の既定ブランチが `master` の場合は、ローカルで `git branch -M main` を実行して `git push -u origin main` を実行し、GitHub の **Settings > Branches** で既定ブランチを `main` に変更します。
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログインし、**Workers & Pages** を開きます。
3. **Create application** → **Pages** → **Import an existing Git repository** を選びます。
4. GitHub を連携し、`Takuto-Ando/ando_profile` を選んで **Begin setup** を選びます。
5. Project name に `takuto-portfolio` を入力します。空いていれば公開URLは `https://takuto-portfolio.pages.dev` になります。
6. Build settings を次の値にします。

   | 項目 | 値 |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | `Jekyll` |
   | Build command | `bundle exec jekyll build` |
   | Build output directory | `_site` |

7. **Environment variables** で Production と Preview の両方に `RUBY_VERSION=3.2.3` を追加します。秘密情報は不要です。
8. **Save and Deploy** を選び、初回ビルド完了後に `https://takuto-portfolio.pages.dev` を確認します。

Cloudflare Pages は GitHub と連携済みのリポジトリで `main` へ push されるたびに、自動でビルドとデプロイを実行します。

```bash
git add .
git commit -m "Update portfolio"
git push
```

## 公開前チェック

- `_config.yml` の `url` は Cloudflare Pages URL、`baseurl` は空文字です。
- 画像・PDF はすべてリポジトリ内の相対パスを使用します。
- `jekyll-sitemap` により `sitemap.xml`、テーマにより `robots.txt` が生成されます。
- ページタイトル・description・OGP は Jekyll SEO Tag を含む Minimal Mistakes テーマの標準メタデータから生成されます。
- favicon は `assets/images/ando2.png` を使用します。
