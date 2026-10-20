# FAE Design Win Simulator

TI非公式のIndustrial FAE学習アプリ。React + TypeScript + Vite / IndexedDB。
公開URL: https://takuto-ando.github.io/ando_profile/fae-simulator/

## 学習

案件トレーニングの1ページで4択・理由選択・IC選定・ブロック図・記述・ヒアリング・本格提案を扱う。出題範囲・ジャンル・Lv.1〜5を選択でき、初期表示は約1分の技術判断問題。管理・独立ライブラリ画面、ファイル取り込みUIはない。教材は同梱済み。

- 選択肢直下に正誤・短い解説・次へを表示。詳細・根拠・ChatGPT復習は折りたたむ。自己評価は任意。
- 数字キー1〜4で回答、保存後のEnter/Nで次へ。入力・ダイアログ操作中は無効。時間制限・誤答ペナルティ・自動昇級なし。
- IC候補には担当機能・仕様を表示し、型番暗記を要求しない。採用実績と今回の適合性は区別。不適合候補しかない場合は追加確認・別候補探索を選ぶ。
- Lv.4〜5の要件整理・ヒアリング・技術条件チェック・根拠管理・競合比較・反証・レビュー保存も維持。TIへの切替を強制せず、根拠不足は未検証とする。
- 全体の回答済み数・未回答数・進捗・弱点と履歴を表示する。

## 教材と品質

14教材・参照資料を共通レジストリへ統合。397件に正規化し、重複218件を統合。240件を出題し、暗記・条件不足・不適切な誤答など157件は品質確認待ちとして出題しない。元ID・資料名・章/箇所・ハッシュ・説明・確度を保持する。Product Lab/Taxonomyの各16,520製品カードは参照資料であり、同数のクイズを生成しない。

基礎21テーマ×3レベルの63形式、IC選定6テーマ×3レベルの18形式、取り込み240問を共通UIで扱う。産業FAE教材の初動対応6案件も追加。

指定Excelの164型番と既存IC案件27件を保持。本格提案でも候補選択できる。AM2434、TLV62090、TPS2121、TMP451、DP83826系の仕様はTIデータシートの改訂・箇所・確認日を保持。電流・熱・外付けなど未確認条件は成立確認済みとしない。

Notion由来110参照を型番構成ごとに83件へ統合して同梱。顧客・詳細用途・本文・非公開URLを除き、型番・採用の記載・匿名出典・ハッシュを保持する。採用理由は不明。資料に記載された情報と独立確認済み事実は区別する。元HTML/PDF・Excel・Notion全体・個人履歴は公開しない。

## 履歴

IndexedDBのDB名・バージョン・保存キーは変更しない。既存回答・理解度・復習・カスタムIC資料・Notionデータを保持し、保存済み教材を優先する。旧問題スナップショットも残し、再演習は対応する技術判断問題へ接続する。内部のJSON入出力・パーサは保持するが通常UIには出さない。

端末・ブラウザ・origin間の自動同期はない。サイトデータ削除で履歴も消える。初回オンライン読込後はオフライン演習可能。外部資料リンクの内容はキャッシュしない。API・アップロード・analyticsはない。

## 開発

Node.js 22 / npm。このディレクトリで実行する。

```bash
npm ci
npm run check
npm test
npm run dev
npm run build:public
```

公開出力はdist-public、既定baseは/ando_profile/fae-simulator/。別パスはFAE_BASE_PATHで末尾/付き指定。公開ビルドはpublicDirを無効化し、HTML・JS・CSS・SWだけを出力する。

教材更新は開発者が実行し、差分と公開範囲をレビューする。利用者の取り込み操作は不要。

```bash
npx tsx scripts/compile-curriculum.ts /path/to/ti_block_diagrams src/data/curriculum.json
npx tsx scripts/compile-notion-training.ts /private/notion.json /path/to/TI_Product_Learning_Lab.html src/data/notion-training.json
npm run import:ic -- /path/to/reference.xlsx src/data/ic-reference.json
```

元資料は変更しない。仕様を推測で補完しない。生のpublic/data、Notionエクスポート、認証情報をGitへ追加しない。

Playwright実走確認（公開ビルド配信先URLを指定）：

```bash
python3 tests/browser_catalogue.py --url URL --output /tmp/fae-catalogue
python3 tests/browser_tempo.py --url URL --output /tmp/fae-tempo
python3 tests/browser_workflow.py --url URL --output /tmp/fae-workflow
```

catalogueは標準教材の匿名Notion83件を前提とし、管理UI除去・IC選定・出題範囲・旧履歴/カスタム資料保持・オフラインを検証する。tempoは1366×768、1280×600、390×844の操作位置とキーボードを検証。workflowはヒアリング・致命的矛盾・競合維持・反証・レビュー保存を検証する。非公開Notionが必要な単体テスト1件は公開repoではskip。

GitHub Actionsで検査・ビルドしてJekyll出力へ合流する。Service Workerはアプリのサブパスのみが対象。
