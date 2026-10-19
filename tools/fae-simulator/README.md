# FAE Design Win Simulator — Web edition

TI非公式の個人学習アプリ。React + TypeScript + Vite / IndexedDB。
Lv.1の1分4択から、Lv.5のヒアリング・成立性検証まで対応する。
TIへの置換を前提とせず、採用の記載と推定された採用理由を区別する。

## 利用

公開URL: https://takuto-ando.github.io/ando_profile/fae-simulator/
管理者ページの解除後一覧からも開ける。アプリ自体は公開され、管理者パスワードでは保護されない。

- 初期値はLv.1・1問。1/3/5/10問、3段階ヒント、自己評価、苦手分野の復習に対応。
- Lv.1〜3は18の基礎論点を3形式で扱う。Lv.4は要件・構成・比較、Lv.5は既存の本格演習。
- 時間制限・誤答ペナルティ・自動昇級なし。自由文の技術正誤は自動断定しない。
- 公開版には基礎問題と架空案件のみを同梱する。Notion実例は利用する端末でZIP/CSV等を取り込む。
- 回答と取り込んだ事例はブラウザ内へ保存する。API・アップロード・analytics・自動同期はない。
- 初回オンライン読込後はオフライン学習可能。根拠の外部リンク/PDFは同梱しない。

## 履歴を引き継ぐ

以前のローカル版の「データ管理」で履歴JSONをエクスポートする。
Web版の「データ管理」からインポートすると、新旧の回答を同一IDは既存優先で統合する。
ローカル版とWeb版、異なる端末・ブラウザは保存領域が異なるため自動では移らない。
ブラウザのデータ削除前にJSONでバックアップする。機密・顧客の非公開資料は取り込まない。

## 開発・ビルド

Node.js 22 / npm。ここで実行する。

```bash
npm ci
npm run check
npm test
npm run dev
npm run build:public
```

公開出力は `dist-public/`。既定baseは `/ando_profile/fae-simulator/`。
別パスの場合は `FAE_BASE_PATH` 環境変数に末尾 `/` 付きのパスを指定する。
public buildは `publicDir` を無効にし、出力ファイルもHTML・JS・CSS・SWに限定して検査する。
`public/data/`、`data/notion-export/`、履歴JSON、認証情報をGitへ追加しない。
実例を使うローカルテスト1件は、同梱データがないこのリポジトリではskipする。他の単体テストは架空fixtureだけを使う。

GitHub Actionsはこのソースを検査・ビルドし、Jekyll出力へ合流させる。
ソースディレクトリ自体はJekyllの出力対象外だが、GitHubリポジトリでは公開される。
Service Workerはアプリのサブパスだけを対象とし、プロフィールやadminのページはキャッシュしない。
