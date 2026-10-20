import { useMemo, useState } from "react";
import { safeUrl } from "./importer";
import {
  icEligible,
  icDomain,
  icPriority,
  importIcWorkbook,
  validateIcLibrary,
  type IcLibrary,
  type IcReference,
} from "./ic-reference";
import type { Question } from "./model";
import type { ShortQuestion } from "./short-model";

function IcDetails({
  entry,
  library,
}: {
  entry: IcReference;
  library: IcLibrary;
}) {
  const url = safeUrl(entry.productUrl);
  return (
    <div className="ic-details">
      <p>
        <b>{entry.partNumber}</b> · {entry.classification}
      </p>
      <p>役割（資料記載）：{entry.role || "不明"}</p>
      <p>採用例（資料記載）：{entry.adoptionExample || "不明"}</p>
      <p>採用証拠ラベル（元資料）：{entry.adoptionEvidence}</p>
      <p>情報源の種類（元資料）：{entry.sourceType}</p>
      <p>機能説明の確度（元資料）：{entry.explanationConfidence}</p>
      <p>インターフェース（要照合）：{entry.interfaces || "不明"}</p>
      <p>設計確認：{entry.designChecks || "不明"}</p>
      <p>採用理由：不明。今回の要求への適合：未検証。</p>
      <details>
        <summary>仕様の元記載・出典・注意事項</summary>
        <p>
          仕様欄の原文（このアプリでは未照合）：{entry.specifications || "不明"}
        </p>
        <p>{entry.caution}</p>
        <details>
          <summary>シートの元記載を表示</summary>
          <pre>
            {JSON.stringify(
              { "IC Master": entry.rawMaster, "IC 詳細解説": entry.rawDetail },
              null,
              2,
            )}
          </pre>
        </details>
        {url && (
          <p>
            <a href={url} target="_blank" rel="noreferrer">
              製品ページ候補を開く（採用根拠URLではありません）
            </a>
          </p>
        )}
        <p>
          採用の原典URL・該当引用・原典確認日：未提供。A/Bは元資料のラベルであり、このアプリで外部検証した判定ではありません。
        </p>
        <p>
          {library.source.path} / IC Master 行{entry.masterRow} / IC 詳細解説 行
          {entry.detailRow}
        </p>
        <p>SHA256: {library.source.sha256}</p>
        <p>取り込み日時（原典確認日とは別）：{library.importedAt}</p>
      </details>
    </div>
  );
}

export function IcCandidatePicker({
  library,
  onSelect,
}: {
  library: IcLibrary | null;
  onSelect: (entry: IcReference) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const entries = useMemo(
    () =>
      (library?.entries ?? [])
        .filter((entry) =>
          `${entry.partNumber} ${entry.classification} ${entry.role} ${entry.adoptionExample}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((first, second) => icPriority(first) - icPriority(second)),
    [library, query],
  );
  const entry = entries.find((item) => item.partNumber === selected);
  return (
    <details className="panel ic-picker">
      <summary>採用記載ICから提案候補を選ぶ</summary>
      {!library ? (
        <p>
          「採用ICライブラリ」または「データ管理」でExcelを取り込むと候補を選べます。
        </p>
      ) : (
        <>
          <p>
            選択は候補の記録のみです。成立性や点数は保証せず、仕様根拠は自動入力しません。
          </p>
          <label>
            候補ICを検索
            <input
              aria-label="候補ICを検索"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setMessage("");
              }}
            />
          </label>
          <label>
            候補IC
            <select
              aria-label="候補IC"
              value={entry?.partNumber ?? ""}
              onChange={(event) => {
                setSelected(event.target.value);
                setMessage("");
              }}
            >
              <option value="">選択してください</option>
              {entries.map((item) => (
                <option key={item.partNumber} value={item.partNumber}>
                  P{icPriority(item)} · {item.partNumber} ·{" "}
                  {item.classification}
                </option>
              ))}
            </select>
          </label>
          {entry && (
            <>
              <IcDetails entry={entry} library={library} />
              <button
                type="button"
                onClick={() => {
                  onSelect(entry);
                  setMessage(
                    `${entry.partNumber}を未検証の候補として提案に追加しました。`,
                  );
                }}
              >
                候補を提案に追加
              </button>
            </>
          )}
          {message && <p role="status">{message}</p>}
        </>
      )}
    </details>
  );
}

export function IcLibraryPanel({
  library,
  onImport,
  shortQuestions,
  cases,
  onShort,
  onCase,
}: {
  library: IcLibrary | null;
  onImport: (library: IcLibrary) => Promise<void>;
  shortQuestions: ShortQuestion[];
  cases: Question[];
  onShort: (question: ShortQuestion) => void;
  onCase: (question: Question, level: 4 | 5) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState("");
  const entries = (library?.entries ?? [])
    .filter(
      (entry) =>
        (!priority || String(icPriority(entry)) === priority) &&
        `${entry.partNumber} ${entry.classification} ${entry.role} ${entry.adoptionExample}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((first, second) => icPriority(first) - icPriority(second));
  const active = entries.find((entry) => entry.partNumber === selected);
  async function receive(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("資料は10MB以下にしてください");
      const next = file.name.toLowerCase().endsWith(".json")
        ? validateIcLibrary(JSON.parse(await file.text()))
        : await importIcWorkbook({
            path: file.name,
            bytes: new Uint8Array(await file.arrayBuffer()),
          });
      await onImport(next);
      setSelected("");
      setMessage(
        `${next.entries.length}型番を端末内に保存しました。既存の事例・回答履歴は保持しています。`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }
  function exportLibrary() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(library, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fae-ic-reference.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="panel" aria-label="採用ICライブラリ">
      <h2>採用ICライブラリ</h2>
      <p>
        採用例と役割を学び、提案の引き出しを増やします。A/Bは元資料の評価、採用理由・性能適合は別途検証します。
      </p>
      {library && (
        <p>
          教材は読み込み済みです。Excelの取り込みなしで学習・提案を始められます。
        </p>
      )}
      <details>
        <summary>別のIC資料に差し替える（任意）</summary>
        <label className="file-label">
          IC資料Excel / バックアップJSONを取り込む
          <input
            type="file"
            accept=".xlsx,.json"
            aria-label="IC資料を取り込む"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void receive(file);
            }}
          />
        </label>
        <p>
          ファイルは端末内で解析します。アップロードしません。再取り込みはIC資料のみ置換し、Notion事例・既存履歴は保持します。
        </p>
      </details>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {library && (
        <>
          <p>
            {library.entries.length}型番 / A/B優先{" "}
            {library.entries.filter((entry) => icPriority(entry) < 3).length}
            型番 / 資料読解対象 {library.entries.filter(icEligible).length}型番
          </p>
          <p>
            P1：Industrial関連のA/B → P2：その他A/B →
            P3：C/D・要検証。系列推定・未同定は読解クイズや実例演習の自動生成から除外します。
          </p>
          <button type="button" onClick={exportLibrary}>
            IC資料JSONをエクスポート
          </button>
          <div className="short-settings">
            <label>
              IC・役割・採用例を検索
              <input
                aria-label="ICライブラリを検索"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              優先度
              <select
                aria-label="ICの学習優先度"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="">すべて（優先順）</option>
                <option value="1">P1 · Industrial A/B</option>
                <option value="2">P2 · その他 A/B</option>
                <option value="3">P3 · 要検証 C/D</option>
              </select>
            </label>
          </div>
          <p>{entries.length}型番を表示</p>
          <label>
            学習するIC
            <select
              aria-label="学習するIC"
              value={active?.partNumber ?? ""}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">選択してください</option>
              {entries.map((entry) => (
                <option key={entry.partNumber} value={entry.partNumber}>
                  P{icPriority(entry)} · {entry.partNumber} ·{" "}
                  {entry.adoptionExample || "採用先不明"}
                </option>
              ))}
            </select>
          </label>
          {active && (
            <>
              <IcDetails entry={active} library={library} />
              <p>
                関連カテゴリの技術判断から学ぶ（このICの適合や採用理由を確認する問題ではありません）。
              </p>
              <div className="short-actions">
                {shortQuestions
                  .filter(
                    (question) => question.theme === icDomain(active).theme,
                  )
                  .slice(0, 3)
                  .map((question) => (
                    <button key={question.id} onClick={() => onShort(question)}>
                      Lv.{question.level}{" "}
                      {question.level === 1
                        ? "技術判断4択"
                        : question.level === 2
                          ? "技術判断と理由"
                          : "短い提案"}
                      を始める
                    </button>
                  ))}
                {cases
                  .filter(
                    (question) =>
                      question.id === `ic-case-${active.partNumber}`,
                  )
                  .map((question) => (
                    <div key={question.id} className="short-actions">
                      <button onClick={() => onCase(question, 4)}>
                        このICの提案演習を始める
                      </button>
                      <button onClick={() => onCase(question, 5)}>
                        顧客確認・成立性検証まで進める（Lv.5）
                      </button>
                    </div>
                  ))}
              </div>
              {!icEligible(active) && (
                <p>
                  この型番は候補参照のみです。採用根拠や機能説明の確認が足りないため、自動クイズ・実例演習は作成しません。他の案件では未検証候補として選べます。
                </p>
              )}
            </>
          )}
          <details>
            <summary>
              取り込み情報と欠損・注意 {library.warnings.length}件
            </summary>
            <p>
              {library.source.path} / SHA256 {library.source.sha256}
            </p>
            <ul>
              {library.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
}
