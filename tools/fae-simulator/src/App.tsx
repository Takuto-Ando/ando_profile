import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  categories,
  competitionQuestions,
  reverseQuestions,
  virtualQuestions,
} from "./questions";
import {
  confidenceLabels,
  dimensions,
  emptyAnswers,
  type Answers,
  type Attempt,
  type Dataset,
  type LearningState,
  type Question,
} from "./model";
import {
  buildPrompt,
  evaluate,
  reviewPriority,
  validateLearningState,
} from "./learning";
import { safeUrl } from "./importer";
import {
  loadDataset,
  loadLearning,
  saveLearning,
  loadIcLibrary,
} from "./storage";
import { icCases, icSelectionText, type IcLibrary } from "./ic-reference";
import { IcCandidatePicker } from "./IcLibraryPanel";
import { bundledIcLibrary } from "./bundled-ic";
import { bundledNotion } from "./bundled-notion";
import {
  importedQuestions,
  curriculumRegistry,
  curriculumScopes,
  industrialDrills,
} from "./curriculum";
import { icSelectionQuestions } from "./ic-exercises";
import { decisionQuestions as baseShortQuestions } from "./decision-questions";
import { createWorkflow, assessWorkflow } from "./workflow";
import {
  errorLabels,
  type ErrorCategory,
  type WorkflowState,
} from "./workflow-model";
import { validateReview } from "./workflow-validation";
import {
  WorkflowPanel,
  ReviewPanel,
  NotionEvidencePanel,
} from "./WorkflowPanel";
import { caseEvidence } from "./evidence";
import { LearningPath, ShortHistory } from "./LearningPath";
import type { ShortAttempt, ShortQuestion } from "./short-model";

type Page = "learn" | "dashboard" | "history";
type Mode = Question["mode"] | "review";
const modeLabels: Record<Mode, string> = {
  virtual: "仮想顧客案件",
  reverse: "Design Win逆算",
  competition: "競合対策",
  review: "復習",
};
const fieldLabels: Record<string, string> = {
  customer: "顧客",
  application: "搭載製品",
  industry: "業界",
  products: "TI製品・製品群",
  partNumbers: "型番（製品欄から抽出）",
  challenge: "顧客課題",
  adoptionReason: "選定理由",
  competitors: "競合への言及",
  priority: "学習優先度",
};
const date = (value: string) => new Date(value).toLocaleString("ja-JP");
const totalPoints = (attempt: Attempt) =>
  attempt.evaluations.reduce((sum, item) => sum + item.points, 0);
function Urls({ urls }: { urls: string[] }) {
  return (
    <div className="source-links">
      {urls.length ? (
        urls
          .map((url) => safeUrl(url))
          .filter((url): url is string => !!url)
          .map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          ))
      ) : (
        <p>根拠URLは未整理／不明です。</p>
      )}
    </div>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  const [requestedLevel, setRequestedLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [page, setPage] = useState<Page>("learn");
  useEffect(() => {
    document
      .getElementById(page === "learn" ? "exercise-workspace" : "study-tools")
      ?.scrollIntoView();
  }, [page]);
  const [practiceLevel, setPracticeLevel] = useState<4 | 5>(5);
  const [initialShort, setInitialShort] = useState<ShortQuestion | undefined>();
  const [shortLaunch, setShortLaunch] = useState(0);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [icLibrary, setIcLibrary] = useState<IcLibrary | null>(
    bundledIcLibrary,
  );
  const [learning, setLearning] = useState<LearningState>({
    schemaVersion: 1,
    attempts: [],
    favorites: [],
  });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const [mode, setMode] = useState<Mode>("virtual");
  const [activeScope, setActiveScope] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [active, setActive] = useState<Question | null>(null);
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers());
  const [selfRating, setSelfRating] = useState(3);
  const [followup, setFollowup] = useState("");
  const [result, setResult] = useState<Attempt | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowState>(() =>
    createWorkflow(virtualQuestions[0]),
  );
  const [errorFilter, setErrorFilter] = useState<ErrorCategory | "">("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const library = await loadIcLibrary();
        if (!cancelled && library) setIcLibrary(library);
      } catch (caught) {
        if (!cancelled)
          setNotice(
            `保存済みIC教材の読込に失敗しました。標準教材を利用します。${String(caught)}`,
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stored, custom] = await Promise.all([
          loadLearning(),
          loadDataset(),
        ]);
        if (cancelled) return;
        setLearning(validateLearningState(stored));
        setReady(true);
        if (custom) setDataset(custom);
        else {
          setDataset(bundledNotion);
          if (import.meta.env.VITE_PUBLIC_EDITION !== "true") {
            try {
              const response = await fetch(
                `${import.meta.env.BASE_URL}data/notion.json`,
              );
              if (response.ok) {
                const local = (await response.json()) as Dataset;
                if (
                  !cancelled &&
                  local.schemaVersion === 1 &&
                  Array.isArray(local.records)
                )
                  setDataset(local);
              }
            } catch {
              setNotice("標準教材で演習できます。");
            }
          }
        }
      } catch (caught) {
        if (!cancelled)
          setError(
            `学習データの読込に失敗しました。ブラウザの保存設定を確認してください。${String(caught)}`,
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const status = () => setOnline(navigator.onLine);
    const offlineError = () =>
      setError(
        "オフラインキャッシュの登録に失敗しました。通常の学習・履歴保存は利用できます。",
      );
    window.addEventListener("online", status);
    window.addEventListener("offline", status);
    window.addEventListener("offline-error", offlineError);
    if (import.meta.env.PROD && "serviceWorker" in navigator)
      navigator.serviceWorker.ready.then(() => setOfflineReady(true));
    return () => {
      window.removeEventListener("online", status);
      window.removeEventListener("offline", status);
      window.removeEventListener("offline-error", offlineError);
    };
  }, []);
  const referenceCases = useMemo(
    () => [
      ...new Map(
        [...icCases(bundledIcLibrary), ...icCases(icLibrary)].map(
          (question) => [question.id, question],
        ),
      ).values(),
    ],
    [icLibrary],
  );
  const allShortQuestions = useMemo(
    () => [
      ...baseShortQuestions.map((question) => ({
        ...question,
        sourceIds: ["decision", "industrial", "index"],
      })),
      ...new Map(
        [
          ...icSelectionQuestions(bundledIcLibrary),
          ...icSelectionQuestions(icLibrary),
        ].map((question) => [question.id, question]),
      ).values(),
      ...importedQuestions,
    ],
    [icLibrary],
  );
  const questions = useMemo(
    () => [
      ...virtualQuestions,
      ...competitionQuestions,
      ...industrialDrills,
      ...reverseQuestions(dataset),
      ...referenceCases,
    ],
    [dataset, referenceCases],
  );
  const reviewQuestions = useMemo(() => {
    const snapshots = [
      ...new Map(
        learning.attempts.map((attempt) => [
          attempt.question.id,
          attempt.question,
        ]),
      ).values(),
    ];
    const pool = [
      ...new Map(
        [...snapshots, ...questions].map((question) => [question.id, question]),
      ).values(),
    ];
    return pool
      .filter((question) => reviewPriority(question, learning.attempts) >= 0)
      .sort(
        (first, second) =>
          reviewPriority(second, learning.attempts) -
          reviewPriority(first, learning.attempts),
      );
  }, [questions, learning]);
  const visible = (
    mode === "review"
      ? reviewQuestions
      : questions.filter((question) => question.mode === mode)
  ).filter(
    (question) =>
      (!category ||
        question.category.includes(category as (typeof categories)[number])) &&
      (!difficulty || question.difficulty === Number(difficulty)) &&
      (!favoritesOnly || learning.favorites.includes(question.id)) &&
      (mode !== "review" ||
        !errorFilter ||
        learning.attempts.some(
          (attempt) =>
            attempt.question.id === question.id &&
            attempt.assessment?.errors.includes(errorFilter),
        )),
  );
  const weaknesses = dimensions.map((dimension) => {
    const evaluations = learning.attempts.flatMap((attempt) =>
      attempt.evaluations.filter((item) => item.dimension === dimension.id),
    );
    return {
      ...dimension,
      percent: evaluations.length
        ? Math.round(
            (evaluations.reduce(
              (sum, item) => sum + item.points / item.max,
              0,
            ) /
              evaluations.length) *
              100,
          )
        : 0,
    };
  });
  async function persist(next: LearningState) {
    await saveLearning(next);
    setLearning(next);
  }
  async function action(callback: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await callback();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }
  function start(question: Question, level: 4 | 5 = practiceLevel) {
    setPracticeLevel(level);
    setActive(question);
    setWorkflow(createWorkflow(question));
    setStage(0);
    setAnswers(emptyAnswers());
    setResult(null);
    setSelfRating(3);
    setFollowup("");
    setPromptVisible(false);
    setRequestedLevel(level);
    setPage("learn");
    window.scrollTo(0, 0);
  }
  async function toggleFavorite(id: string) {
    await action(() =>
      persist({
        ...learning,
        favorites: learning.favorites.includes(id)
          ? learning.favorites.filter((value) => value !== id)
          : [...learning.favorites, id],
      }),
    );
  }
  async function submit() {
    if (!active) return;
    await action(async () => {
      const assessment =
        practiceLevel === 5 ? assessWorkflow(workflow) : undefined;
      const attempt: Attempt = {
        id: crypto.randomUUID(),
        question: active,
        answers: { ...answers },
        evaluations: evaluate(active, answers, assessment),
        learningLevel: practiceLevel,
        ...(practiceLevel === 5 ? { workflow: structuredClone(workflow) } : {}),
        assessment,
        notionEvidence: active.record ? caseEvidence(active.record) : undefined,
        createdAt: new Date().toISOString(),
        selfRating,
        followup,
        revealedStage: stage,
      };
      await persist({ ...learning, attempts: [...learning.attempts, attempt] });
      setResult(attempt);
      setNotice(
        practiceLevel === 5
          ? "回答と構造化条件の判定を保存しました。自由記述の技術的な正誤は未判定です。"
          : "Lv.4の提案を保存しました。自由記述の技術的な正誤は未判定です。",
      );
    });
  }
  const adjustedResult = result ? { ...result, selfRating, followup } : null;
  async function updateReview() {
    if (!adjustedResult) return;
    await action(async () => {
      await persist({
        ...learning,
        attempts: learning.attempts.map((attempt) =>
          attempt.id === adjustedResult.id ? adjustedResult : attempt,
        ),
      });
      setResult(adjustedResult);
      setNotice("自己評価と追加質問を保存しました。");
    });
  }
  function navigate(next: Page) {
    setPage(next);
    setNotice("");
    requestAnimationFrame(() =>
      document
        .getElementById(next === "learn" ? "exercise-workspace" : "study-tools")
        ?.scrollIntoView(),
    );
  }
  function showHistory(attempt: Attempt) {
    setPracticeLevel(attempt.learningLevel ?? 5);
    setActive(attempt.question);
    setWorkflow(attempt.workflow ?? createWorkflow(attempt.question));
    setAnswers(attempt.answers);
    setStage(attempt.revealedStage);
    setResult(attempt);
    setSelfRating(attempt.selfRating);
    setFollowup(attempt.followup);
    setPromptVisible(false);
    setRequestedLevel(attempt.learningLevel ?? 5);
    setPage("learn");
  }
  async function importExternalReview(input: unknown) {
    if (!adjustedResult) return;
    await action(async () => {
      const review = validateReview(input, adjustedResult.id);
      const updated = {
        ...adjustedResult,
        externalReviews: [...(adjustedResult.externalReviews ?? []), review],
      };
      await persist({
        ...learning,
        attempts: learning.attempts.map((attempt) =>
          attempt.id === updated.id ? updated : attempt,
        ),
      });
      setResult(updated);
      setNotice(
        "ChatGPTの参考レビューを保存しました。採点は変更していません。",
      );
    });
  }
  async function saveShortAttempt(attempt: ShortAttempt) {
    if (busy) throw new Error("別の保存処理が完了してから再試行してください。");
    setBusy(true);
    try {
      const shortAttempts = [...(learning.shortAttempts ?? [])];
      const existing = shortAttempts.findIndex(
        (item) => item.id === attempt.id,
      );
      if (existing >= 0) shortAttempts[existing] = attempt;
      else shortAttempts.push(attempt);
      const next = { ...learning, shortAttempts };
      validateLearningState(next);
      await persist(next);
    } finally {
      setBusy(false);
    }
  }
  const advancedControls = (
    <>
      <div className="tabs" role="group" aria-label="学習モード">
        {(Object.entries(modeLabels) as [Mode, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              aria-pressed={mode === key}
              className={mode === key ? "selected" : ""}
              onClick={() => setMode(key)}
            >
              {label}
            </button>
          ),
        )}
      </div>
      <div className="filters">
        {mode === "review" && (
          <label>
            復習する誤り
            <select
              aria-label="復習する誤り"
              value={errorFilter}
              onChange={(event) =>
                setErrorFilter(event.target.value as typeof errorFilter)
              }
            >
              <option value="">すべての分類</option>
              {Object.entries(errorLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          ジャンル
          <select
            aria-label="ジャンル"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">すべてのジャンル</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          案件の複雑度（旧分類）
          <select
            aria-label="案件の複雑度"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option value="">すべて</option>
            {[1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          お気に入りのみ
        </label>
      </div>
    </>
  );
  const advancedWorkspace = active ? (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CASE WORKSPACE</p>
          <h2>{active.title}</h2>
        </div>
        <button
          onClick={() => {
            setActive(null);
            setResult(null);
          }}
        >
          案件一覧へ
        </button>
      </div>
      <Panel title="案件情報">
        <div className="badges">
          <span>{modeLabels[active.mode]}</span>
          <span>
            Lv.{practiceLevel} · {practiceLevel === 4 ? "約10〜15分" : "約30分"}
            （時間制限なし）
          </span>
          {active.category.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="prewrap">{active.brief}</p>
        {active.stages.slice(0, stage).map((text, index) => (
          <div className="reveal" key={index}>
            <small>開示 {index + 1}</small>
            <p className="prewrap">{text}</p>
          </div>
        ))}
        {!result && (
          <button
            disabled={stage >= active.stages.length}
            onClick={() => setStage((value) => value + 1)}
          >
            {stage >= active.stages.length
              ? "全ヒント開示済み"
              : `次の情報を開示 (${stage}/${active.stages.length})`}
          </button>
        )}
        <button disabled={busy} onClick={() => toggleFavorite(active.id)}>
          {learning.favorites.includes(active.id)
            ? "★ お気に入り解除"
            : "☆ お気に入り登録"}
        </button>
      </Panel>
      {practiceLevel === 5 && (!result || result.workflow) && (
        <WorkflowPanel
          key={result?.id ?? active.id}
          value={result?.workflow ?? workflow}
          onChange={setWorkflow}
          readOnly={!!result}
          assessment={result?.assessment}
        />
      )}
      {result && !result.workflow && result.learningLevel !== 4 && (
        <div className="callout">
          旧形式の回答です。点数を保持して表示しています。ヒアリング・成立性の遡及判定は行いません。
        </div>
      )}
      {!result ? (
        practiceLevel === 4 || workflow.proposalStartedAt ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <Panel title="提案を組み立てる">
              <p className="muted">
                型番の暗記より、要件との対応・理由・検証計画を記述してください。未確認情報は明記できます。
              </p>
              <IcCandidatePicker
                library={icLibrary}
                onSelect={(entry) => {
                  if (
                    !icLibrary ||
                    answers.selection.includes(
                      `候補TI型番: ${entry.partNumber}\n`,
                    )
                  )
                    return;
                  setAnswers((current) => ({
                    ...current,
                    selection: [
                      current.selection,
                      icSelectionText(entry, icLibrary),
                    ]
                      .filter(Boolean)
                      .join("\n\n"),
                  }));
                  setWorkflow((current) => ({
                    ...current,
                    products: {
                      ...current.products,
                      ti: [current.products.ti, entry.partNumber]
                        .filter(Boolean)
                        .join(" / "),
                    },
                  }));
                }}
              />
              {dimensions.map((item) => (
                <label className="answer-field" key={item.id}>
                  <span>
                    {item.label}
                    <b>{item.max}点</b>
                  </span>
                  <small>{item.prompt}</small>
                  <textarea
                    required
                    rows={4}
                    value={answers[item.id]}
                    onChange={(event) =>
                      setAnswers((value) => ({
                        ...value,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="考え方と、その根拠・確認方法を記述…"
                  />
                </label>
              ))}
              <label className="answer-field">
                自己評価
                <select
                  aria-label="自己評価"
                  value={selfRating}
                  onChange={(event) =>
                    setSelfRating(Number(event.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value} / 5{" "}
                      {value === 1 ? "要復習" : value === 5 ? "自信あり" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="answer-field">
                追加で質問したい内容
                <textarea
                  value={followup}
                  onChange={(event) => setFollowup(event.target.value)}
                  rows={2}
                />
              </label>
              <div className="callout">
                自由記述は最大60/100点の構造評価です。
                {practiceLevel === 5
                  ? "別途、入力した必須条件・能力値・根拠を照合し、致命的な矛盾がある選択案は総点20点以下に制限します。"
                  : "Lv.4では技術的成立性の確認は行いません。条件・能力値・根拠まで検証したい場合はLv.5を選んでください。"}
              </div>
              <button className="primary" disabled={busy} type="submit">
                {busy ? "保存中…" : "回答を保存して参考情報と比較"}
              </button>
            </Panel>
          </form>
        ) : null
      ) : (
        <>
          <Panel
            title={`暫定評価 ${totalPoints(result)} / 100点（今回の上限${result.assessment?.scoreCap ?? 60}点）`}
          >
            <p className="callout">
              自由記述の技術的な正誤は「評価不能」。構造化した条件の照合結果は別表示します。低い構造点だけで誤答とは扱いません。
            </p>
            {result.evaluations.map((item) => (
              <div className="evaluation" key={item.dimension}>
                <h3>
                  {
                    dimensions.find((value) => value.id === item.dimension)
                      ?.label
                  }{" "}
                  <span>
                    {item.points}/{item.max} · 技術妥当性：評価不能
                  </span>
                </h3>
                <p>{item.explanation}</p>
                <small>検出した論点: {item.matched.join("、") || "なし"}</small>
                <p>要再確認: {item.missing.join("、") || "技術妥当性の照合"}</p>
                <details>
                  <summary>自分の回答と期待する論点</summary>
                  <p className="prewrap">{result.answers[item.dimension]}</p>
                  <p>{active.rubric[item.dimension].expected}</p>
                </details>
              </div>
            ))}
          </Panel>
          {active.record && <NotionEvidencePanel record={active.record} />}
          <Panel title="参考解答と出典">
            <p className="prewrap">{active.reference}</p>
            <Urls urls={active.urls} />
            {active.record && (
              <details>
                <summary>元資料の記載・本文・出典ファイル</summary>
                {Object.entries(active.record.fields).map(([key, field]) => (
                  <div className="evidence" key={key}>
                    <b>{fieldLabels[key]}</b>
                    <span className={`confidence ${field.confidence}`}>
                      {confidenceLabels[field.confidence]}
                    </span>
                    <p>
                      {field.value || "不明"}
                      <small>抽出元: {field.basis}</small>
                    </p>
                  </div>
                ))}
                <pre>{JSON.stringify(active.record.properties, null, 2)}</pre>
                <p className="prewrap">{active.record.body}</p>
                <pre>{JSON.stringify(active.record.sources, null, 2)}</pre>
                <p>
                  添付参照: {active.record.attachments.join("、") || "なし"}
                  （内容未解析）
                </p>
              </details>
            )}
          </Panel>
          <ReviewPanel
            key={result.id}
            attempt={result}
            onImport={importExternalReview}
            busy={busy}
          />
          <Panel title="ChatGPTで厳密に復習する">
            <label className="answer-field">
              自己評価
              <select
                aria-label="自己評価"
                value={selfRating}
                onChange={(event) => setSelfRating(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="answer-field">
              追加で質問したい内容
              <textarea
                rows={2}
                value={followup}
                onChange={(event) => setFollowup(event.target.value)}
              />
            </label>
            <button disabled={busy} onClick={updateReview}>
              自己評価・追加質問を保存
            </button>
            <button
              className="primary"
              onClick={() =>
                action(async () => {
                  if (!adjustedResult) return;
                  await navigator.clipboard.writeText(
                    buildPrompt(adjustedResult),
                  );
                  setNotice("ChatGPT用プロンプトをコピーしました。");
                })
              }
            >
              ChatGPT用プロンプトをコピー
            </button>
            <button onClick={() => setPromptVisible((value) => !value)}>
              プロンプトを表示
            </button>
            {promptVisible && (
              <textarea
                className="prompt-output"
                aria-label="ChatGPT用復習プロンプト"
                readOnly
                value={adjustedResult ? buildPrompt(adjustedResult) : ""}
                rows={18}
              />
            )}
            <p className="muted">
              ボタンはコピーのみです。ChatGPTへの送信は手動です。コピー不可の場合は表示して選択できます。
            </p>
            <button onClick={() => start(active)}>この案件を再演習</button>
          </Panel>
        </>
      )}
    </>
  ) : null;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          FW<span>FAE WORKSPACE</span>
        </div>
        <h1>
          Design Win
          <br />
          Simulator<span>Industrial Digital FAE</span>
        </h1>
        <nav aria-label="メインナビゲーション">
          {(
            [
              ["learn", "00", "案件トレーニング"],
              ["dashboard", "01", "ダッシュボード"],

              ["history", "03", "回答履歴"],
            ] as const
          ).map(([target, number, label]) => (
            <button
              key={target}
              className={page === target ? "nav-active" : ""}
              onClick={() => navigate(target)}
            >
              <span>{number}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className={`status-dot ${online ? "" : "offline"}`} />
          {online
            ? import.meta.env.VITE_PUBLIC_EDITION === "true"
              ? "Web学習 · 端末内保存"
              : "ローカル学習"
            : "オフライン"}
          <p>
            {offlineReady
              ? "オフライン用データ準備済み"
              : import.meta.env.DEV
                ? "開発版 · オフラインはbuild後に有効"
                : "オフラインキャッシュ準備中"}
          </p>
          <small>
            外部API・自動送信なし
            <br />
            TI非公式の個人学習ツール
          </small>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>LEARN THROUGH CUSTOMER PROBLEMS</span>
          <span>YOUR FAE FIELD NOTES</span>
        </header>
        {error && (
          <div role="alert" className="banner error">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="banner">
            {notice}
          </div>
        )}
        {!ready ? (
          <Panel title="学習データを読み込み中">
            <p>
              IndexedDBを確認しています。
              {error && "保存設定を確認して再読込してください。"}
            </p>
          </Panel>
        ) : (
          <>
            {
              <LearningPath
                key={`${initialShort?.id ?? "learning-path"}-${shortLaunch}`}
                curriculumScopes={curriculumScopes}
                curriculumReport={curriculumRegistry.report}
                onScopeChange={(scope) => {
                  setActiveScope(scope);
                  setMode(
                    scope === "ic" || scope === "notion"
                      ? "reverse"
                      : "virtual",
                  );
                }}
                attempts={learning.shortAttempts ?? []}
                shortQuestions={allShortQuestions}
                caseAttempts={learning.attempts}
                questions={questions}
                onSave={saveShortAttempt}
                advancedWorkspace={advancedWorkspace}
                selectedLevel={active ? practiceLevel : requestedLevel}
                advancedControls={advancedControls}
                advancedQuestions={
                  activeScope === "customer" ? questions : visible
                }
                favorites={learning.favorites}
                onFavorite={(id) => void toggleFavorite(id)}
                onLevelChange={(level) => {
                  setRequestedLevel(level);
                  setActive(null);
                  setPage("learn");
                }}
                onAdvanced={start}
                shortcutsEnabled={page === "learn"}
                initialQuestion={initialShort}
              />
            }
            <div id="study-tools">
              {page === "dashboard" && (
                <>
                  <div className="hero">
                    <div>
                      <p className="eyebrow">FROM REQUIREMENTS TO DESIGN WIN</p>
                      <h2>
                        顧客の課題から、
                        <br />
                        採用される提案へ。
                      </h2>
                      <p>
                        要件を聞き、構成を描き、選定の根拠を伝える。
                        <br />
                        案件を通して、FAEの判断を磨く。
                      </p>
                      <button
                        className="primary"
                        onClick={() => {
                          setMode("virtual");
                          setActive(null);
                          setRequestedLevel(practiceLevel);
                          setPage("learn");
                        }}
                      >
                        案件トレーニングを始める <span>↗</span>
                      </button>
                    </div>
                    <div className="flow-card">
                      <span>SYSTEM THINKING</span>
                      {[
                        "顧客要求 / Requirements",
                        "システム構成 / Architecture",
                        "製品選定 / Selection",
                        "評価・提案 / Design Win",
                      ].map((text, index) => (
                        <div key={text}>
                          <b>0{index + 1}</b>
                          {text}
                          {index !== 3 && <i>↓</i>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="stat-grid">
                    <article>
                      <span>NOTION CASES</span>
                      <strong>
                        {dataset?.report.eligible ?? 0}
                        <small>件</small>
                      </strong>
                      <p>逆算演習に利用できる事例</p>
                    </article>
                    <article>
                      <span>PRACTICE LOG</span>
                      <strong>
                        {learning.attempts.length}
                        <small>回</small>
                      </strong>
                      <p>保存済みの回答</p>
                    </article>
                    <article>
                      <span>BOOKMARKS</span>
                      <strong>
                        {learning.favorites.length}
                        <small>件</small>
                      </strong>
                      <p>お気に入りの案件</p>
                    </article>
                  </div>
                  <div className="two-columns">
                    <Panel title="4つの学習モード">
                      <div className="mode-grid">
                        {(Object.entries(modeLabels) as [Mode, string][]).map(
                          ([key, label], index) => (
                            <button
                              className="mode-card"
                              key={key}
                              onClick={() => {
                                setMode(key);
                                setActive(null);
                                setRequestedLevel(practiceLevel);
                                setPage("learn");
                              }}
                            >
                              <small>MODE 0{index + 1}</small>
                              <b>{label} ↗</b>
                              <span>
                                {
                                  [
                                    "架空の要求から提案を組み立てる",
                                    "Notion事例を段階的に開示する",
                                    "現行維持も含め、置換を判断する",
                                    "低い自己評価・苦手分野を優先する",
                                  ][index]
                                }
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </Panel>
                    <Panel title="弱点分析 / 記述構造の暫定値">
                      <p className="muted">
                        技術的な正誤・習熟度は未判定。各項目の暫定上限は60%です。
                      </p>
                      {weaknesses.map((item) => (
                        <div className="metric" key={item.id}>
                          <div>
                            <span>{item.label}</span>
                            <b>
                              {learning.attempts.length
                                ? `${item.percent}%`
                                : "未受験"}
                            </b>
                          </div>
                          <progress value={item.percent} max={100} />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setMode("review");
                          setActive(null);
                          setRequestedLevel(practiceLevel);
                          setPage("learn");
                        }}
                      >
                        復習の案件を選ぶ →
                      </button>
                    </Panel>
                  </div>
                  <Panel title="ジャンルごとの振り返り">
                    <div className="genre-grid">
                      {categories.map((genre) => {
                        const attempts = learning.attempts.filter((attempt) =>
                          attempt.question.category.includes(genre),
                        );
                        return (
                          <div key={genre}>
                            <b>{genre}</b>
                            <span>
                              {attempts.length}回 · 自己評価{" "}
                              {attempts.length
                                ? (
                                    attempts.reduce(
                                      (sum, attempt) =>
                                        sum + attempt.selfRating,
                                      0,
                                    ) / attempts.length
                                  ).toFixed(1) + "/5"
                                : "未記録"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                </>
              )}
              {page === "dashboard" && (
                <Panel title="誤りの分類と復習">
                  <div className="genre-grid">
                    {Object.entries(errorLabels).map(([key, label]) => (
                      <div key={key}>
                        <b>{label}</b>
                        <span>
                          {
                            learning.attempts.filter((attempt) =>
                              attempt.assessment?.errors.includes(
                                key as ErrorCategory,
                              ),
                            ).length
                          }
                          件
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="muted">
                    分類は構造化検証がある回答のみ。未検証を技術条件違反と混同しません。
                  </p>
                </Panel>
              )}
              {page === "history" && (
                <>
                  <div className="page-heading">
                    <div>
                      <p className="eyebrow">LEARNING HISTORY</p>
                      <h2>回答履歴</h2>
                      <p>回答時点の案件・採点基準・出典を保持します。</p>
                    </div>
                  </div>
                  <ShortHistory
                    catalog={allShortQuestions}
                    attempts={learning.shortAttempts ?? []}
                    onRetry={(question) => {
                      setShortLaunch((value) => value + 1);
                      setActive(null);
                      setRequestedLevel(question.level);
                      setInitialShort(question);
                      setPage("learn");
                    }}
                  />
                  <Panel
                    title={`${learning.attempts.length}件の本格演習の記録`}
                  >
                    {[...learning.attempts].reverse().map((attempt) => (
                      <article className="history-row" key={attempt.id}>
                        <div>
                          <b>{attempt.question.title}</b>
                          <small>
                            {date(attempt.createdAt)} ·{" "}
                            {modeLabels[attempt.question.mode]} · Lv.
                            {attempt.learningLevel ?? 5}
                          </small>
                        </div>
                        <span>
                          暫定 {totalPoints(attempt)}/100 · 自己評価{" "}
                          {attempt.selfRating}/5
                          <small>
                            {attempt.assessment?.errors
                              .map((category) => errorLabels[category])
                              .join(" / ") || "構造化検証の誤り分類なし"}
                          </small>
                        </span>
                        <button onClick={() => showHistory(attempt)}>
                          回答・復習を開く
                        </button>
                      </article>
                    ))}
                    {!learning.attempts.length && <p>まだ回答がありません。</p>}
                  </Panel>
                </>
              )}
            </div>
          </>
        )}
        <footer>
          FAE DESIGN WIN SIMULATOR{" "}
          <span>記載・推定・未確認を分けて、判断する。</span>
        </footer>
      </main>
    </div>
  );
}
