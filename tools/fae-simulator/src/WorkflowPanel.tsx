import { useState } from "react";
import {
  activateCounter,
  askCustomer,
  beginProposal,
  coveredTopics,
  expectedText,
  hasEvidence,
  requirementsFor,
} from "./workflow";
import {
  checkLabels,
  comparisonMetrics,
  errorLabels,
  type CandidateKey,
  type DesignClaim,
  type TechnicalAssessment,
  type WorkflowState,
} from "./workflow-model";
import type { Attempt, CaseRecord } from "./model";
import { caseEvidence } from "./evidence";

const candidateLabel = { ti: "TI候補", competitor: "現行・競合候補" };
function ClaimEditor({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: DesignClaim;
  onChange: (value: DesignClaim) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="claim-editor" disabled={disabled}>
      <label>
        {label}
        <input
          aria-label={`能力・条件 ${label}`}
          value={value.value}
          onChange={(event) =>
            onChange({ ...value, value: event.target.value })
          }
          placeholder="例：50 us / 18..30 V / EtherCAT"
        />
      </label>
      <details>
        <summary>
          根拠{" "}
          {hasEvidence(value.citation)
            ? "照合申告あり（外部未検証）"
            : "未検証"}
        </summary>
        <label>
          根拠URL
          <input
            aria-label={`根拠URL ${label}`}
            type="url"
            value={value.citation.url}
            onChange={(event) =>
              onChange({
                ...value,
                citation: { ...value.citation, url: event.target.value },
              })
            }
          />
        </label>
        <label>
          該当箇所・条件・引用
          <textarea
            aria-label={`該当箇所 ${label}`}
            rows={2}
            value={value.citation.excerpt}
            onChange={(event) =>
              onChange({
                ...value,
                citation: { ...value.citation, excerpt: event.target.value },
              })
            }
          />
        </label>
        <label>
          確認日
          <input
            aria-label={`確認日 ${label}`}
            type="date"
            value={value.citation.checkedAt}
            onChange={(event) =>
              onChange({
                ...value,
                citation: { ...value.citation, checkedAt: event.target.value },
              })
            }
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            aria-label={`原典照合 ${label}`}
            checked={value.citation.reviewed}
            onChange={(event) =>
              onChange({
                ...value,
                citation: { ...value.citation, reviewed: event.target.checked },
              })
            }
          />
          原典の対象製品・条件・該当箇所を自分で照合した
        </label>
      </details>
    </fieldset>
  );
}
export function WorkflowPanel({
  value,
  onChange,
  readOnly = false,
  assessment,
}: {
  value: WorkflowState;
  onChange: (value: WorkflowState) => void;
  readOnly?: boolean;
  assessment?: TechnicalAssessment;
}) {
  const [question, setQuestion] = useState("");
  const covered = coveredTopics(value);
  const requirements = requirementsFor(value);
  const ask = (text: string) => {
    onChange(askCustomer(value, text));
    setQuestion("");
  };
  const changeClaim = (
    id: string,
    candidate: CandidateKey,
    claim: DesignClaim,
  ) =>
    onChange({
      ...value,
      entries: {
        ...value.entries,
        [id]: { ...value.entries[id], [candidate]: claim },
      },
    });
  return (
    <>
      <section className="panel workflow-panel">
        <h2>1. 顧客ヒアリング</h2>
        <p className="muted">
          {value.profile.fictional
            ? "追加条件は架空案件の設定です。製品仕様・採用実績ではありません。"
            : "元資料の記載範囲で回答します。原本にない非公開条件は不明のままです。"}{" "}
          質問の回数ではなく、重要な論点の確認状況を記録します。
        </p>
        {!readOnly && (
          <>
            <label className="answer-field">
              顧客への質問
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (question.trim()) ask(question);
                  }
                }}
                placeholder="入力電圧の変動範囲は？ 既存ソフトの移行工数は？"
              />
            </label>
            <button disabled={!question.trim()} onClick={() => ask(question)}>
              顧客へ質問する
            </button>
            <details>
              <summary>確認する論点の例</summary>
              <div className="topic-buttons">
                {value.profile.topics.map((topic) => (
                  <button key={topic.id} onClick={() => ask(topic.question)}>
                    {covered.includes(topic.id) ? "✓ " : ""}
                    {topic.label}
                  </button>
                ))}
              </div>
            </details>
          </>
        )}
        <p className="muted">
          確認した論点：{covered.length}/{value.profile.topics.length}
          （案件の公開情報を含む）
        </p>
        {value.interview.length ? (
          <div className="interview-log">
            {value.interview.map((item) => (
              <article key={item.id}>
                <b>質問：{item.question}</b>
                <p className="prewrap">{item.answer}</p>
                <small>
                  {item.topicIds.length
                    ? "対応論点：" +
                      item.topicIds
                        .map(
                          (id) =>
                            value.profile.topics.find(
                              (topic) => topic.id === id,
                            )?.label ?? id,
                        )
                        .join("、")
                    : "対応する論点なし"}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">
            追加質問はまだありません。確認不足でも提案へ進めます。
          </p>
        )}
      </section>
      <section className="panel workflow-panel">
        <h2>2. 要件整理シート</h2>
        <p className="muted">
          「仮定」は顧客確認済みと区別します。未確認の値を推測して成立扱いにしません。
        </p>
        {requirements.map((requirement) => {
          const entry = value.entries[requirement.id];
          const available =
            requirement.public || covered.includes(requirement.topicId);
          return (
            <article className="requirement-row" key={requirement.id}>
              <h3>
                {requirement.label}
                {requirement.critical && (
                  <span className="critical-badge">必須</span>
                )}
              </h3>
              <p className="muted">
                顧客条件：
                {available || readOnly
                  ? expectedText(requirement)
                  : "未開示。顧客へ質問して確認する。"}
                <br />
                {requirement.context}
              </p>
              <div className="requirement-knowledge">
                <label>
                  確認状態
                  <select
                    aria-label={`確認状態 ${requirement.id}`}
                    disabled={readOnly}
                    value={entry.knowledge}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        entries: {
                          ...value.entries,
                          [requirement.id]: {
                            ...entry,
                            knowledge: event.target
                              .value as typeof entry.knowledge,
                          },
                        },
                      })
                    }
                  >
                    <option value="unknown">未確認</option>
                    <option value="assumed">仮定</option>
                    <option
                      value="confirmed"
                      disabled={!available || requirement.source === "unknown"}
                    >
                      確認済み
                    </option>
                  </select>
                </label>
                <label>
                  仮定・不足情報・確認方法
                  <input
                    aria-label={`要件メモ ${requirement.id}`}
                    disabled={readOnly}
                    value={entry.notes}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        entries: {
                          ...value.entries,
                          [requirement.id]: {
                            ...entry,
                            notes: event.target.value,
                          },
                        },
                      })
                    }
                  />
                </label>
              </div>
              {value.proposalStartedAt &&
                requirement.id === "migration-budget" && (
                  <p className="muted">
                    能力値と根拠は比較シートの移行工数欄で入力します（例：20
                    h）。
                  </p>
                )}
              {value.proposalStartedAt &&
                requirement.id !== "migration-budget" && (
                  <div className="candidate-grid">
                    {(["ti", "competitor"] as CandidateKey[]).map(
                      (candidate) => (
                        <ClaimEditor
                          key={candidate}
                          label={`${requirement.label} ${candidateLabel[candidate]}`}
                          disabled={readOnly}
                          value={entry[candidate]}
                          onChange={(claim) =>
                            changeClaim(requirement.id, candidate, claim)
                          }
                        />
                      ),
                    )}
                  </div>
                )}
            </article>
          );
        })}
        {value.proposalStartedAt ? (
          <div className="callout">
            提案開始時に未確認だった要件：
            {value.uncheckedAtProposal
              .map(
                (id) =>
                  requirements.find((requirement) => requirement.id === id)
                    ?.label ??
                  value.profile.topics.find((topic) => topic.id === id)
                    ?.label ??
                  id,
              )
              .join("、") || "なし"}
            。開始後も質問や設計を修正できます。
          </div>
        ) : (
          <button
            className="primary"
            disabled={readOnly}
            onClick={() => onChange(beginProposal(value))}
          >
            要件を整理して提案に進む
          </button>
        )}
      </section>
      {value.proposalStartedAt && (
        <section className="panel workflow-panel">
          <h2>3. TI・現行品の設計と比較</h2>
          <p className="callout">
            数値は単位付きで入力します（50 us、1 ms、18..30 V、-20..85
            °C）。I/Fは規格名を入力します。構成の識別情報と原典の該当箇所・確認日がそろっても、外部資料の真偽や実機動作は自動検証しません。
          </p>
          <div className="candidate-grid">
            {(["ti", "competitor"] as CandidateKey[]).map((candidate) => (
              <label key={candidate}>
                {candidateLabel[candidate]}の製品・提案構成
                <input
                  aria-label={`製品・構成 ${candidate}`}
                  disabled={readOnly}
                  value={value.products[candidate]}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      products: {
                        ...value.products,
                        [candidate]: event.target.value,
                      },
                    })
                  }
                  placeholder="正確な型番・グレード・必要な周辺回路"
                />
              </label>
            ))}
          </div>
          <p className="muted">
            上の要件整理シートに、両候補の動作範囲・I/F・要求性能と根拠を入力してください。
          </p>
          {comparisonMetrics.map((metric) => (
            <div className="comparison-row" key={metric.id}>
              <h3>{metric.label}</h3>
              <div className="candidate-grid">
                {(["ti", "competitor"] as CandidateKey[]).map((candidate) => (
                  <ClaimEditor
                    key={candidate}
                    label={`${metric.label} ${candidateLabel[candidate]}`}
                    disabled={readOnly}
                    value={value.comparison[metric.id][candidate]}
                    onChange={(claim) =>
                      onChange({
                        ...value,
                        comparison: {
                          ...value.comparison,
                          [metric.id]: {
                            ...value.comparison[metric.id],
                            [candidate]: claim,
                          },
                        },
                      })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
          <label className="answer-field">
            提案判断
            <select
              aria-label="提案判断"
              disabled={readOnly}
              value={value.decision}
              onChange={(event) =>
                onChange({
                  ...value,
                  decision: event.target.value as WorkflowState["decision"],
                })
              }
            >
              <option value="defer">選定保留・追加確認</option>
              <option value="switch">TI構成へ切り替える</option>
              <option value="keep">現行・競合構成を維持する</option>
            </select>
          </label>
          <label className="answer-field">
            判断理由と採用・撤退条件
            <textarea
              aria-label="判断理由と採用・撤退条件"
              disabled={readOnly}
              rows={3}
              value={value.rationale}
              onChange={(event) =>
                onChange({ ...value, rationale: event.target.value })
              }
            />
          </label>
          <details open={value.counterActive}>
            <summary>4. 顧客からの追加条件・反証</summary>
            {value.profile.counter ? (
              <>
                {value.counterActive ? (
                  <p className="callout">{value.profile.counter.message}</p>
                ) : (
                  <button
                    disabled={readOnly}
                    onClick={() => onChange(activateCounter(value))}
                  >
                    追加条件を受け取る
                  </button>
                )}
              </>
            ) : (
              <p>
                この実例には追加条件の根拠がありません。架空の顧客条件は追加しません。
              </p>
            )}
          </details>
        </section>
      )}
      {assessment && <TechnicalSummary assessment={assessment} state={value} />}
    </>
  );
}
function TechnicalSummary({
  assessment,
  state,
}: {
  assessment: TechnicalAssessment;
  state: WorkflowState;
}) {
  return (
    <section className="panel workflow-panel">
      <h2>5. 構造化条件の成立性検証</h2>
      <div
        aria-label="選択案の成立性"
        className={`technical-status ${assessment.status}`}
      >
        選択案：{checkLabels[assessment.status]} · 記述構造点の上限{" "}
        {assessment.scoreCap}/100点
      </div>
      <p>
        重要論点の確認率：{assessment.hearingCoverage}%（質問数による加点なし）
      </p>
      <p>{assessment.decisionFeedback}</p>
      <p className="muted">
        判定は選択した候補に適用します。根拠の照合は自己申告です。未入力・不明・手動判定事項は未検証として保持します。
      </p>
      <div className="badges">
        {assessment.errors.map((category) => (
          <span key={category}>{errorLabels[category]}</span>
        ))}
      </div>
      {(["ti", "competitor"] as CandidateKey[]).map((candidate) => (
        <details
          key={candidate}
          open={candidate === (state.decision === "keep" ? "competitor" : "ti")}
        >
          <summary>{candidateLabel[candidate]}の条件別判定</summary>
          {assessment.checks
            .filter((check) => check.candidate === candidate)
            .map((check) => (
              <article className="technical-check" key={check.requirementId}>
                <b>{check.label}</b>
                <span className={`check-badge ${check.status}`}>
                  {checkLabels[check.status]}
                  {check.fatal ? "・致命的矛盾" : ""}
                </span>
                <p>
                  要求：{check.expected}
                  <br />
                  提案：{check.observed || "未入力"}
                </p>
                <p>{check.reason}</p>
              </article>
            ))}
        </details>
      ))}
      <p>
        未確認のまま残った要件：
        {assessment.omissions
          .map(
            (id) =>
              requirementsFor(state).find(
                (requirement) => requirement.id === id,
              )?.label ??
              state.profile.topics.find((topic) => topic.id === id)?.label ??
              id,
          )
          .join("、") || "なし"}
      </p>
      <p>
        未解決・仮定・条件未確定：
        {assessment.unresolved
          .map(
            (id) =>
              requirementsFor(state).find(
                (requirement) => requirement.id === id,
              )?.label ??
              state.profile.topics.find((topic) => topic.id === id)?.label ??
              id,
          )
          .join("、") || "なし"}
      </p>
    </section>
  );
}
export function NotionEvidencePanel({ record }: { record: CaseRecord }) {
  const evidence = caseEvidence(record);
  return (
    <section className="panel">
      <h2>搭載確認と採用理由の根拠</h2>
      <p>
        <b>採用・搭載確認：</b>
        {evidence.adoptionConfirmation.value}
      </p>
      <p className="muted">
        分類：
        {evidence.adoptionConfirmation.classification === "fact"
          ? "記載事実（外部未確認）"
          : "未確認"}
      </p>
      <p>
        <b>採用理由：</b>
        {evidence.adoptionReason.value}
      </p>
      <p className="muted">
        分類：
        {evidence.adoptionReason.classification === "inference"
          ? "推定"
          : "未確認"}
        。非公開の理由を正解にしません。
      </p>
      {evidence.references.length ? (
        evidence.references.map((reference, index) => (
          <div key={index} className="evidence">
            <p>{reference.url}</p>
            <p>該当箇所：{reference.excerpt || "未確認"}</p>
            <p>原典確認日：{reference.checkedAt || "不明"} · 外部未検証</p>
          </div>
        ))
      ) : (
        <p>根拠URL・該当箇所・確認日は不明です。</p>
      )}
    </section>
  );
}
export function ReviewPanel({
  attempt,
  onImport,
  busy,
}: {
  attempt: Attempt;
  onImport: (input: unknown) => Promise<void>;
  busy: boolean;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [reviewJson, setReviewJson] = useState("");
  async function importJson() {
    setError("");
    try {
      if (reviewJson.length > 1024 * 1024)
        throw new Error("レビューは1MB以下にしてください");
      await onImport(JSON.parse(reviewJson));
    } catch (caught) {
      setError(String(caught));
    }
  }
  return (
    <section className="panel">
      <h2>ChatGPTレビューを保存</h2>
      <p className="muted">
        外部レビューは参考情報として保存します。採点や根拠の確度を自動的に上書きしません。復習プロンプト末尾にJSONの出力形式が含まれます。
      </p>
      {error && <p role="alert">{error}</p>}
      <label className="answer-field">
        レビュー本文
        <textarea
          aria-label="レビュー本文"
          rows={5}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>
      <button
        disabled={busy || !content.trim()}
        onClick={() =>
          onImport({
            schemaVersion: 1,
            attemptId: attempt.id,
            source: "ChatGPT",
            reviewedAt: new Date().toISOString().slice(0, 10),
            content,
          })
        }
      >
        レビュー本文を保存
      </button>
      <details>
        <summary>ChatGPTレビューJSONを貼り付ける</summary>
        <textarea
          aria-label="ChatGPTレビューJSON"
          value={reviewJson}
          onChange={(event) => setReviewJson(event.target.value)}
        />
        <button
          disabled={busy || !reviewJson.trim()}
          onClick={() => void importJson()}
        >
          レビューJSONを保存
        </button>
      </details>
      {(attempt.externalReviews ?? []).map((review) => (
        <details key={review.id}>
          <summary>
            ChatGPT参考レビュー · {review.reviewedAt}（外部未検証）
          </summary>
          <p className="prewrap">{review.content}</p>
        </details>
      ))}
    </section>
  );
}
