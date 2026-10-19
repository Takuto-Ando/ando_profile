import { useRef, useState } from "react";
import type { Attempt, Question } from "./model";
import { shortQuestions } from "./short-questions";
import {
  advancedPool,
  buildShortPrompt,
  gradeShort,
  levelInfo,
  learningProgress,
  nextHint,
  relatedCases,
  revealedChoices,
  shortCorrect,
  shortPool,
  shortSession,
} from "./short-learning";
import {
  levels,
  themes,
  type LearningLevel,
  type ShortAnswers,
  type ShortAttempt,
  type ShortQuestion,
} from "./short-model";
import { safeUrl } from "./importer";
import { NotionEvidencePanel } from "./WorkflowPanel";

export function LearningPath({
  attempts,
  caseAttempts = [],
  questions,
  onSave,
  onAdvanced,
  initialQuestion,
}: {
  attempts: ShortAttempt[];
  caseAttempts?: Attempt[];
  questions: Question[];
  onSave: (attempt: ShortAttempt) => Promise<void>;
  onAdvanced: (question: Question, level: 4 | 5) => void;
  initialQuestion?: ShortQuestion;
}) {
  const [level, setLevel] = useState<LearningLevel>(
    initialQuestion?.level ?? 1,
  );
  const [theme, setTheme] = useState("");
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(1);
  const [review, setReview] = useState(false);
  const [queue, setQueue] = useState<ShortQuestion[]>(
    initialQuestion ? [initialQuestion] : [],
  );
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<ShortAnswers>({
    selection: null,
    reason: null,
    proposal: "",
  });
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<ShortAttempt | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");
  const [promptVisible, setPromptVisible] = useState(false);
  const [preferred, setPreferred] = useState<ShortQuestion | null>(null);
  const [notionId, setNotionId] = useState("");
  const lock = useRef(false);
  const selectionLock = useRef(false);
  const question = queue[index];
  const pool = shortPool(shortQuestions, attempts, level, theme, review, query);
  const progress = learningProgress(
    shortQuestions,
    attempts,
    questions,
    caseAttempts,
  );
  const advanced = preferred
    ? relatedCases(preferred, questions)
    : advancedPool(questions, theme, query);
  const notionCases = questions.filter(
    (candidate) =>
      candidate.mode === "reverse" &&
      candidate.category.some((category) =>
        question?.category.includes(category),
      ),
  );
  const activeNotion = questions.find((candidate) => candidate.id === notionId);

  function resetAnswer() {
    setAnswers({ selection: null, reason: null, proposal: "" });
    setHints(0);
    setResult(null);
    setSaveError("");
    setMessage("");
    setPromptVisible(false);
    setNotionId("");
    selectionLock.current = false;
  }
  function changeLevel(
    next: LearningLevel,
    source: ShortQuestion | null = null,
  ) {
    if (lock.current) return;
    setLevel(next);
    setQueue([]);
    setFinished(false);
    setPreferred(source);
    resetAnswer();
  }
  function begin() {
    const session = shortSession(pool, count);
    setQueue(session);
    setIndex(0);
    setFinished(false);
    setSessionIds([]);
    resetAnswer();
    window.scrollTo(0, 0);
  }
  async function persist(attempt: ShortAttempt) {
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setSaveError("");
    setResult(attempt);
    try {
      await onSave(attempt);
      setResult(attempt);
      setSessionIds((ids) =>
        ids.includes(attempt.id) ? ids : [...ids, attempt.id],
      );
    } catch (error) {
      setSaveError(
        `保存できませんでした。${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  async function submit(next: ShortAnswers) {
    if (!question || result || lock.current) return;
    const snapshot = {
      ...question,
      ...(activeNotion && level === 3 ? { notionContext: activeNotion } : {}),
    };
    const attempt: ShortAttempt = {
      id: crypto.randomUUID(),
      question: snapshot,
      answers: next,
      result: gradeShort(snapshot, next),
      hintsUsed: hints,
      selfAssessment: "unrated",
      createdAt: new Date().toISOString(),
    };
    setResult(attempt);
    await persist(attempt);
  }
  function choose(id: string) {
    if (selectionLock.current || result || lock.current) return;
    selectionLock.current = true;
    const next = { ...answers, selection: id };
    setAnswers(next);
    if (question.level === 1) void submit(next);
  }
  function advance() {
    if (saving || saveError || !result) return;
    if (queue.length === 1) {
      const next = pool.find((candidate) => candidate.id !== question.id);
      if (next) {
        setQueue([next]);
        setIndex(0);
        setSessionIds([]);
        resetAnswer();
        window.scrollTo(0, 0);
        return;
      }
    }
    if (index + 1 >= queue.length) setFinished(true);
    else {
      setIndex(index + 1);
      resetAnswer();
    }
    window.scrollTo(0, 0);
  }
  async function copyPrompt() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildShortPrompt(result, attempts));
      setMessage("復習プロンプトをコピーしました。送信は行いません。");
    } catch {
      setPromptVisible(true);
      setMessage(
        "コピーできないため、表示された文章を手動でコピーしてください。",
      );
    }
  }
  const currentResult = result?.question ?? question;
  const selectionResult =
    result &&
    currentResult.selection.options.find(
      (option) => option.id === result.answers.selection,
    );
  const sessionAttempts = attempts.filter((attempt) =>
    sessionIds.includes(attempt.id),
  );
  const levelNavigation = (
    <div className="level-tabs" role="group" aria-label="学習レベル">
      {levels.map((item) => (
        <button
          key={item.level}
          aria-pressed={level === item.level}
          className={level === item.level ? "selected" : ""}
          disabled={saving}
          onClick={() => changeLevel(item.level)}
        >
          <b>Lv.{item.level}</b>
          <span>{item.time}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </div>
  );

  return (
    <section className="learning-path" aria-label="段階的学習">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ONE SMALL STEP</p>
          <h2>1分からのFAE学習</h2>
          <p>1問だけでもOK。時間制限・減点・自動昇級はありません。</p>
        </div>
      </div>
      {question && !finished && level <= 3 ? (
        <details className="level-switch">
          <summary>レベルを変更する（現在Lv.{level}）</summary>
          {levelNavigation}
        </details>
      ) : (
        levelNavigation
      )}
      {saveError && (
        <div className="banner error" role="alert">
          {saveError}
          {result && (
            <button disabled={saving} onClick={() => void persist(result)}>
              保存を再試行
            </button>
          )}
        </div>
      )}
      {message && <p role="status">{message}</p>}
      {!question || finished || level > 3 ? (
        <>
          {finished && (
            <section className="panel" aria-label="今回の学習結果">
              <h3>ここまでで終了しても大丈夫。</h3>
              <p>
                {sessionAttempts.length}問を記録しました。選択問題の正解{" "}
                {sessionAttempts.filter(shortCorrect).length}
                問。提案文の技術正誤は自動判定しません。
              </p>
              <p>
                次もLv.{level}
                のままです。上のレベルへ進むときだけ、自分で選んでください。
              </p>
            </section>
          )}
          <section className="panel">
            <h3>
              Lv.{level} · {levelInfo(level).label}{" "}
              <small>{levelInfo(level).time} / 目安・制限なし</small>
            </h3>
            {level <= 3 && (
              <button
                className="primary"
                disabled={!pool.length || saving}
                onClick={begin}
              >
                {level === 1 ? "1分問題を始める" : `Lv.${level}を始める`}
              </button>
            )}
            <details className="learning-progress">
              <summary>
                全体の進捗：{progress.overall.completed} /{" "}
                {progress.overall.total}問回答済み （{progress.overall.percent}
                %）
              </summary>
              <progress
                aria-label="全問題の回答進捗"
                value={progress.overall.completed}
                max={Math.max(1, progress.overall.total)}
              />
              <p>未回答：{progress.overall.remaining}問</p>
              <ul>
                {progress.byLevel.map((item) => (
                  <li key={item.level}>
                    Lv.{item.level}：{item.completed} / {item.total}問回答済み
                  </li>
                ))}
                <li>
                  Lv.4〜5 案件演習：{progress.cases.completed} /{" "}
                  {progress.cases.total}件回答済み
                </li>
              </ul>
              <p className="muted">
                現在の問題一覧が対象です。再回答は重複せず、正誤にかかわらず保存済みの回答を数えます。
                Lv.1〜3は同じテーマでも別問題、Lv.4〜5は同じ案件を1件として集計します。
                検索・復習条件では総数は変わりません。教材統合・実例取り込みで総数は増えます。
              </p>
            </details>
            <div className="short-settings">
              <label>
                学習ジャンル
                <select
                  aria-label="学習ジャンル"
                  value={theme}
                  onChange={(event) => {
                    setTheme(event.target.value);
                    setPreferred(null);
                  }}
                >
                  <option value="">すべて（おすすめ順）</option>
                  {themes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                問題を検索
                <input
                  type="search"
                  aria-label="短時間問題を検索"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="シリーズ・機能・型番"
                />
              </label>
              {level <= 3 && (
                <>
                  <label>
                    連続演習
                    <select
                      aria-label="連続演習"
                      value={count}
                      onChange={(event) => setCount(Number(event.target.value))}
                    >
                      {[1, 3, 5, 10].map((value) => (
                        <option key={value} value={value}>
                          {value}問{value === 1 ? "だけ" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={review}
                      onChange={(event) => setReview(event.target.checked)}
                    />
                    間違い・曖昧・苦手カテゴリを復習
                  </label>
                </>
              )}
            </div>
            {level <= 3 ? (
              <>
                <p className="muted">
                  {pool.length}問の候補。
                  {count > pool.length && pool.length > 0
                    ? `重複させず${pool.length}問で終了します。`
                    : "1問につき1つの学び。ヒントを使っても減点しません。"}
                </p>
                {!pool.length && (
                  <p>
                    該当する問題がありません。ジャンル・検索・復習条件を変更してください。
                  </p>
                )}
              </>
            ) : (
              <>
                <p>
                  {level === 4
                    ? "要件・ブロック構成・製品候補・競合比較を整理します。ヒアリングは不要です。"
                    : "既存の顧客ヒアリング・条件整理・根拠照合・反証・競合/コスト比較を含む本格演習です。"}
                </p>
                {preferred && (
                  <p>
                    「{preferred.title}」と同じテーマの発展問題です。
                    <button onClick={() => setPreferred(null)}>
                      全案件に戻す
                    </button>
                  </p>
                )}
                <div className="question-grid">
                  {advanced.map((candidate) => (
                    <article className="question-card" key={candidate.id}>
                      <small>
                        {candidate.mode === "reverse"
                          ? "Notion由来・記載と推定を区別"
                          : "架空案件"}{" "}
                        · Lv.{level}
                      </small>
                      <h3>{candidate.title}</h3>
                      <p>{candidate.brief}</p>
                      <button
                        onClick={() => onAdvanced(candidate, level as 4 | 5)}
                      >
                        Lv.{level}の案件を開く
                      </button>
                    </article>
                  ))}
                </div>
                {!advanced.length && (
                  <p>
                    該当する案件がありません。ジャンルや検索を変更してください。
                  </p>
                )}
              </>
            )}
          </section>
          {level <= 3 && (
            <section className="panel">
              <h3>短時間学習の振り返り</h3>
              <p>
                {attempts.length}問の回答を記録。自己評価「まだ曖昧」
                {
                  attempts.filter(
                    (attempt) => attempt.selfAssessment === "unclear",
                  ).length
                }
                件。
              </p>
              <div className="genre-grid">
                {themes.map((item) => {
                  const related = attempts.filter(
                    (attempt) => attempt.question.theme === item.id,
                  );
                  return (
                    <div key={item.id}>
                      <b>{item.label}</b>
                      <span>
                        {related.length
                          ? `選択問題 ${related.filter(shortCorrect).length}/${related.length}問正解 · 曖昧 ${related.filter((attempt) => attempt.selfAssessment === "unclear").length}件`
                          : "未学習"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="muted">
                ヒント利用後の正解も含みます。正答率だけで習熟と判断せず、曖昧な項目と苦手カテゴリを復習します。
              </p>
            </section>
          )}
        </>
      ) : (
        <>
          <article
            className="panel short-question"
            key={question.id}
            aria-labelledby="short-question-title"
          >
            <div className="badges">
              <span>
                Lv.{level} · {levelInfo(level).time}
              </span>
              <span>
                {index + 1}/{queue.length}問
              </span>
              <span>
                {themes.find((item) => item.id === question.theme)?.label}
              </span>
            </div>
            <h3 id="short-question-title">{question.title}</h3>
            <p className="short-stem">{question.selection.prompt}</p>
            <div
              className="short-options"
              role="group"
              aria-label="製品・機能の選択肢"
            >
              {revealedChoices(question, hints).map((option) => (
                <button
                  key={option.id}
                  disabled={!!answers.selection || !!result || saving}
                  aria-pressed={answers.selection === option.id}
                  aria-label={option.text}
                  data-answer-state={
                    result
                      ? option.id === question.selection.correctId
                        ? "correct"
                        : option.id === result.answers.selection
                          ? "incorrect"
                          : undefined
                      : undefined
                  }
                  onClick={() => choose(option.id)}
                >
                  {result && option.id === question.selection.correctId && (
                    <strong aria-hidden="true">✓ 正解 · </strong>
                  )}
                  {result &&
                    option.id === result.answers.selection &&
                    !result.result.selectionCorrect && (
                      <strong aria-hidden="true">✕ 不正解 · </strong>
                    )}
                  {option.text}
                </button>
              ))}
            </div>
            {!result && (
              <div className="short-hints">
                <button
                  disabled={hints >= 3 || saving}
                  onClick={() => setHints(nextHint(hints))}
                >
                  {hints >= 3
                    ? "ヒントをすべて表示済み"
                    : `ヒント${hints + 1}を見る`}
                </button>
                <ol>
                  {hints >= 1 && <li>{question.hints[0]}</li>}
                  {hints >= 2 && <li>{question.hints[1]}</li>}
                  {hints >= 3 && (
                    <li>候補を2つに絞りました。正解はこの中です。</li>
                  )}
                </ol>
              </div>
            )}
            {level === 2 && answers.selection && question.reason && (
              <section aria-label="選定理由">
                <h4>{question.reason.prompt}</h4>
                <p className="muted">
                  この設問の正しい選択を支持する理由を選びます。
                </p>
                <div className="short-options">
                  {question.reason.options.map((option) => (
                    <button
                      key={option.id}
                      disabled={saving || !!result}
                      aria-label={option.text}
                      data-answer-state={
                        result
                          ? option.id === question.reason?.correctId
                            ? "correct"
                            : option.id === result.answers.reason
                              ? "incorrect"
                              : undefined
                          : undefined
                      }
                      onClick={() => {
                        const next = { ...answers, reason: option.id };
                        setAnswers(next);
                        void submit(next);
                      }}
                    >
                      {result && option.id === question.reason?.correctId && (
                        <strong aria-hidden="true">✓ 正解 · </strong>
                      )}
                      {result &&
                        option.id === result.answers.reason &&
                        !result.result.reasonCorrect && (
                          <strong aria-hidden="true">✕ 不正解 · </strong>
                        )}
                      {option.text}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {level === 3 && !result && (
              <>
                <label className="answer-field">
                  短い提案（1〜3文を目安）
                  <textarea
                    aria-label="短い提案"
                    rows={3}
                    maxLength={1000}
                    value={answers.proposal}
                    onChange={(event) =>
                      setAnswers({ ...answers, proposal: event.target.value })
                    }
                    placeholder="選んだ機能をどう使うか、理由と次に確認する条件を書いてみましょう。"
                  />
                </label>
                <details>
                  <summary>Notionの実例を使って提案する（任意）</summary>
                  <label>
                    関連する実例
                    <select
                      aria-label="関連する実例"
                      value={notionId}
                      onChange={(event) => setNotionId(event.target.value)}
                    >
                      <option value="">架空の基礎問題のまま</option>
                      {notionCases.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  {activeNotion && (
                    <>
                      <p>{activeNotion.stages[0]}</p>
                      <p>{activeNotion.stages[1]}</p>
                      <p>
                        この実例での候補・使い方と、追加で確認すべき条件を1〜3文で提案してください。上の4択は基礎知識の確認であり、実際の採用型番・採用理由を当てるものではありません。候補の実例への適合は未検証です。
                      </p>
                    </>
                  )}
                </details>
                <button
                  className="primary"
                  disabled={
                    !answers.selection || !answers.proposal.trim() || saving
                  }
                  onClick={() => void submit(answers)}
                >
                  短い提案を保存して振り返る
                </button>
              </>
            )}
            {result && (
              <section
                className="short-feedback"
                aria-label="解答と解説"
                role="status"
              >
                <h4>
                  {shortCorrect(result) ? "正解！" : "ここが学びのポイント"}
                </h4>
                <p>
                  全体の進捗：{progress.overall.completed} /{" "}
                  {progress.overall.total}問回答済み （
                  {progress.overall.percent}%）
                </p>
                <p>
                  {result.result.selectionCorrect
                    ? "製品・機能の選択：正解"
                    : "製品・機能の選択：不正解（減点なし）"}
                  {result.result.reasonCorrect !== null &&
                    ` / 理由：${result.result.reasonCorrect ? "正解" : "不正解（減点なし）"}`}
                </p>
                <p>選んだ回答：{selectionResult?.text}</p>
                <p>{selectionResult?.explanation}</p>
                {!result.result.selectionCorrect && (
                  <p>
                    正解：
                    {
                      question.selection.options.find(
                        (option) => option.id === question.selection.correctId,
                      )?.text
                    }
                  </p>
                )}
                {question.reason && (
                  <>
                    <p>
                      選んだ理由：
                      {
                        question.reason.options.find(
                          (option) => option.id === result.answers.reason,
                        )?.text
                      }
                    </p>
                    <p>
                      正しい理由：
                      {
                        question.reason.options.find(
                          (option) => option.id === question.reason?.correctId,
                        )?.text
                      }
                    </p>
                  </>
                )}
                <h4>10秒で読む基本解説</h4>
                <p>{question.basic}</p>
                <details>
                  <summary>詳しい解説・関連製品・根拠</summary>
                  <p>{question.detailed}</p>
                  <p>
                    関連製品・カテゴリ：{question.relatedProducts.join(" / ")}
                    （実際の採用・適合を示すものではありません）
                  </p>
                  {question.sources.map((source, sourceIndex) => (
                    <p key={sourceIndex}>
                      {safeUrl(source.url) ? (
                        <a
                          href={safeUrl(source.url)!}
                          target="_blank"
                          rel="noreferrer"
                        >
                          根拠：{source.section}
                        </a>
                      ) : (
                        <>学習方針：{source.section}</>
                      )}
                      <small>
                        {" "}
                        ·{" "}
                        {source.checkedAt
                          ? `参照確認 ${source.checkedAt}`
                          : "確認日未記録"}
                        {source.localPath &&
                          ` / ローカル参照 ${source.localPath}`}
                      </small>
                      {source.datasheet && (
                        <>
                          <br />
                          <a
                            href={safeUrl(source.datasheet.url) ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Datasheet: {source.datasheet.partNumber} ·{" "}
                            {source.datasheet.revision}
                          </a>
                          <small>
                            {" "}
                            / 参照箇所：{source.datasheet.section}
                            。版は参照時点の記録です。リンク先の更新に注意してください。
                          </small>
                        </>
                      )}
                    </p>
                  ))}
                </details>
                {level === 3 && (
                  <>
                    <p className="prewrap">
                      自分の提案：{result.answers.proposal}
                    </p>
                    <p>
                      自由文の技術正誤・個別型番の適合は評価不能。参考案と照合し、必要ならChatGPTで振り返れます。
                    </p>
                    <p>
                      参考案の型：「必要な機能を候補にし、入力・出力の経路へ配置する。未確認の定格・精度・遅延は、対象品番と測定条件を確認してから判断する。」
                    </p>
                  </>
                )}
                <div
                  className="short-rating"
                  role="group"
                  aria-label="理解の自己評価"
                >
                  {(
                    [
                      ["understood", "理解できた"],
                      ["unclear", "まだ曖昧"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      aria-pressed={result.selfAssessment === value}
                      disabled={saving || !!saveError}
                      onClick={() =>
                        void persist({ ...result, selfAssessment: value })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="muted">
                  {saving
                    ? "保存中…"
                    : saveError
                      ? "未保存。再試行してください。"
                      : "回答・ヒント利用を保存済み。自己評価は任意です。"}
                </p>
                <div className="short-actions">
                  <button
                    className="primary"
                    disabled={saving || !!saveError}
                    onClick={advance}
                  >
                    {queue.length === 1 &&
                    pool.some((candidate) => candidate.id !== question.id)
                      ? "次の1問へ"
                      : index + 1 < queue.length
                        ? "次の問題へ"
                        : "この演習を終了"}
                  </button>
                  <button
                    disabled={saving || !!saveError}
                    onClick={() => setFinished(true)}
                  >
                    1問で終了する
                  </button>
                </div>
                <details>
                  <summary>
                    {level <= 2
                      ? "詳しく知りたいときだけ：ChatGPTで復習"
                      : "ChatGPTで提案を振り返る"}
                  </summary>
                  <button onClick={() => void copyPrompt()}>
                    ChatGPT用プロンプトをコピー
                  </button>
                  <button onClick={() => setPromptVisible(!promptVisible)}>
                    復習プロンプトを表示
                  </button>
                  {promptVisible && (
                    <textarea
                      aria-label="短時間学習の復習プロンプト"
                      readOnly
                      rows={12}
                      value={buildShortPrompt(result, attempts)}
                    />
                  )}
                </details>
                {result.question.notionContext?.record && (
                  <details>
                    <summary>Notionの参考情報と確度</summary>
                    <NotionEvidencePanel
                      record={result.question.notionContext.record}
                    />
                    <p className="prewrap">
                      {result.question.notionContext.reference}
                    </p>
                  </details>
                )}
                <details>
                  <summary>同じテーマを本格演習へつなぐ（任意）</summary>
                  <p>
                    ここでは自動で難しくなりません。進むレベルを選んでください。
                  </p>
                  <button
                    disabled={saving}
                    onClick={() => changeLevel(4, question)}
                  >
                    Lv.4の関連案件を選ぶ
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => changeLevel(5, question)}
                  >
                    Lv.5の関連案件を選ぶ
                  </button>
                </details>
              </section>
            )}
            {!result && (
              <button
                disabled={saving}
                onClick={() => {
                  setQueue([]);
                  resetAnswer();
                }}
              >
                今回はここまで（未回答は保存しない）
              </button>
            )}
          </article>
        </>
      )}
    </section>
  );
}

export function ShortHistory({
  attempts,
  onRetry,
}: {
  attempts: ShortAttempt[];
  onRetry: (question: ShortQuestion) => void;
}) {
  return (
    <section className="panel">
      <h2>短時間学習の履歴 · {attempts.length}件</h2>
      <p>
        選択式の正誤と理解の自己評価。本格演習の暫定点とは分けて記録します。
      </p>
      {[...attempts].reverse().map((attempt) => (
        <article className="history-row" key={attempt.id}>
          <div>
            <b>
              Lv.{attempt.question.level} · {attempt.question.title}
            </b>
            <small>
              {new Date(attempt.createdAt).toLocaleString("ja-JP")} ·{" "}
              {shortCorrect(attempt) ? "選択問題 正解" : "選択問題 要復習"} ·
              ヒント{attempt.hintsUsed}段階 ·{" "}
              {attempt.selfAssessment === "understood"
                ? "理解できた"
                : attempt.selfAssessment === "unclear"
                  ? "まだ曖昧"
                  : "自己評価なし"}
            </small>
            <details>
              <summary>回答・解説を確認</summary>
              <p>{attempt.question.selection.prompt}</p>
              <p>
                回答：
                {
                  attempt.question.selection.options.find(
                    (option) => option.id === attempt.answers.selection,
                  )?.text
                }
              </p>
              {attempt.question.reason && (
                <p>
                  理由：
                  {
                    attempt.question.reason.options.find(
                      (option) => option.id === attempt.answers.reason,
                    )?.text
                  }
                </p>
              )}
              <p>{attempt.question.basic}</p>
              <p>{attempt.question.detailed}</p>
              {attempt.answers.proposal && (
                <p>提案（技術正誤は未判定）：{attempt.answers.proposal}</p>
              )}
            </details>
          </div>
          <button onClick={() => onRetry(attempt.question)}>
            この問題を復習
          </button>
        </article>
      ))}
      {!attempts.length && <p>まだ短時間学習の回答はありません。</p>}
    </section>
  );
}
