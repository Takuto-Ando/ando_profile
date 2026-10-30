import { useMemo, useState } from "react";
import { safeUrl } from "./importer";
import { verifiedIcFacts } from "./ic-exercises";
import { icPriority, type IcLibrary, type IcReference } from "./ic-reference";

function IcDetails({
  entry,
  library,
}: {
  entry: IcReference;
  library: IcLibrary;
}) {
  const url = safeUrl(entry.productUrl);
  const verified = verifiedIcFacts.find(
    (fact) => fact.partNumber === entry.partNumber,
  );
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
      {verified && (
        <p>
          仕様照合メモ：{verified.specifications} / {verified.section}
          （2026-10-20参照）。初期候補の照合用で、システム成立確認ではありません。
        </p>
      )}
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
        <p>教材の読込状態を確認してください。</p>
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
