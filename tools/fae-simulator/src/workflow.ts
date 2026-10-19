import type { Question } from "./model";
import { profileFor } from "./scenarios";
import {
  comparisonMetrics,
  emptyCitation,
  type CandidateKey,
  type Citation,
  type DesignClaim,
  type Requirement,
  type RequirementEntry,
  type TechnicalAssessment,
  type TechnicalCheck,
  type WorkflowState,
} from "./workflow-model";

const units: Record<string, [string, number]> = {
  V: ["voltage", 1],
  mV: ["voltage", 1e-3],
  uV: ["voltage", 1e-6],
  kV: ["voltage", 1e3],
  A: ["current", 1],
  mA: ["current", 1e-3],
  uA: ["current", 1e-6],
  s: ["time", 1],
  ms: ["time", 1e-3],
  us: ["time", 1e-6],
  ns: ["time", 1e-9],
  h: ["time", 3600],
  時間: ["time", 3600],
  Hz: ["frequency", 1],
  kHz: ["frequency", 1e3],
  MHz: ["frequency", 1e6],
  "°C": ["temperature", 1],
  ch: ["channels", 1],
  "%": ["percent", 1],
};
const numberText = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?";
export function parseQuantity(input: string) {
  const normalized = input
    .trim()
    .replaceAll("μ", "u")
    .replaceAll("µ", "u")
    .replaceAll("℃", "°C");
  const match = normalized.match(new RegExp(`^(${numberText})\\s*([^\\s]+)$`));
  if (!match || !units[match[2]]) return null;
  const [dimension, scale] = units[match[2]];
  const value = Number(match[1]) * scale;
  return Number.isFinite(value) ? { value, dimension, unit: match[2] } : null;
}
export function parseRange(input: string) {
  const parts = input.trim().split(/\.\.|〜|～|~/);
  if (parts.length > 2) return null;
  const upper = parseQuantity(parts.at(-1) ?? "");
  if (!upper) return null;
  const lower =
    parts.length === 1
      ? upper
      : (parseQuantity(parts[0]) ??
        (new RegExp(`^${numberText}$`).test(parts[0].trim())
          ? parseQuantity(`${parts[0].trim()} ${upper.unit}`)
          : null));
  if (!lower || lower.dimension !== upper.dimension) return null;
  return { min: lower.value, max: upper.value, dimension: lower.dimension };
}
export function validDate(input: string) {
  const date = new Date(input);
  return (
    /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(input) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === input.slice(0, 10)
  );
}
export function hasEvidence(citation: Citation) {
  try {
    return (
      citation.reviewed &&
      ["https:", "http:"].includes(new URL(citation.url).protocol) &&
      citation.excerpt.trim().length >= 8 &&
      validDate(citation.checkedAt)
    );
  } catch {
    return false;
  }
}
export function requirementsFor(state: WorkflowState): Requirement[] {
  return [
    ...state.profile.requirements,
    ...(state.counterActive && state.profile.counter
      ? [state.profile.counter.requirement]
      : []),
  ];
}
export const emptyClaim = (): DesignClaim => ({
  value: "",
  citation: emptyCitation(),
});
const emptyEntry = (requirement: Requirement): RequirementEntry => ({
  knowledge: requirement.public ? "confirmed" : "unknown",
  notes: "",
  ti: emptyClaim(),
  competitor: emptyClaim(),
});
export function createWorkflow(question: Question): WorkflowState {
  const profile = profileFor(question);
  return {
    version: 1,
    profile,
    interview: [],
    entries: Object.fromEntries(
      profile.requirements.map((requirement) => [
        requirement.id,
        emptyEntry(requirement),
      ]),
    ),
    proposalStartedAt: null,
    uncheckedAtProposal: [],
    counterActive: false,
    decision: "defer",
    rationale: "",
    products: { ti: "", competitor: "" },
    comparison: Object.fromEntries(
      comparisonMetrics.map((metric) => [
        metric.id,
        { ti: emptyClaim(), competitor: emptyClaim() },
      ]),
    ) as WorkflowState["comparison"],
  };
}
export function coveredTopics(state: WorkflowState): string[] {
  return [
    ...new Set([
      ...state.profile.topics
        .filter((topic) => topic.known)
        .map((topic) => topic.id),
      ...state.interview.flatMap((item) => item.topicIds),
    ]),
  ];
}
export function askCustomer(
  state: WorkflowState,
  question: string,
  askedAt = new Date().toISOString(),
): WorkflowState {
  if (!question.trim()) return state;
  const matches = state.profile.topics.filter((topic) =>
    topic.keywords.some((keyword) =>
      question.toLowerCase().includes(keyword.toLowerCase()),
    ),
  );
  const ids = matches.map((topic) => topic.id);
  const entries = { ...state.entries };
  for (const requirement of requirementsFor(state))
    if (ids.includes(requirement.topicId))
      entries[requirement.id] = {
        ...entries[requirement.id],
        knowledge: requirement.source === "unknown" ? "unknown" : "confirmed",
      };
  return {
    ...state,
    entries,
    interview: [
      ...state.interview,
      {
        id: crypto.randomUUID(),
        question: question.trim(),
        topicIds: ids,
        answer:
          matches
            .map((topic) => `${topic.label}: ${topic.answer}`)
            .join("\n") ||
          "質問の対象を特定できません。確認したい技術条件や商談条件を具体的に質問してください。",
        askedAt,
      },
    ],
  };
}
export function beginProposal(
  state: WorkflowState,
  now = new Date().toISOString(),
): WorkflowState {
  if (state.proposalStartedAt) return state;
  return {
    ...state,
    proposalStartedAt: now,
    uncheckedAtProposal: [
      ...new Set([
        ...requirementsFor(state)
          .filter(
            (requirement) =>
              state.entries[requirement.id]?.knowledge !== "confirmed",
          )
          .map((requirement) => requirement.id),
        ...state.profile.topics
          .filter((topic) => !coveredTopics(state).includes(topic.id))
          .map((topic) => topic.id),
      ]),
    ],
  };
}
export function activateCounter(state: WorkflowState): WorkflowState {
  if (!state.profile.counter || state.counterActive) return state;
  const requirement = state.profile.counter.requirement;
  return {
    ...state,
    counterActive: true,
    entries: { ...state.entries, [requirement.id]: emptyEntry(requirement) },
  };
}
const normalizeInterface = (value: string) => {
  const normalized = value.trim().toUpperCase().replace(/[\s-]/g, "");
  return ["BLUETOOTHLE", "BLUETOOTHLOWENERGY"].includes(normalized)
    ? "BLE"
    : normalized;
};
const knownInterfaces = new Set([
  "BLE",
  "WIFI",
  "ETHERNET",
  "ETHERCAT",
  "CANFD",
  "CAN",
  "SPI",
  "I2C",
  "UART",
  "RS485",
  "USB",
  "OLDI",
  "RGB",
  "DPI",
]);
export function expectedText(requirement: Requirement) {
  if (requirement.kind === "manual" || requirement.source === "unknown")
    return "条件未確定・手動検証が必要";
  if (requirement.kind === "interface")
    return requirement.interfaces?.join(" / ") ?? "不明";
  if (requirement.kind === "coverage")
    return `${requirement.min}..${requirement.max} ${requirement.unit} の全範囲`;
  return `${requirement.kind === "maximum" ? requirement.max : requirement.min} ${requirement.unit} ${requirement.kind === "maximum" ? "以下" : "以上"}`;
}
export function checkClaim(
  requirement: Requirement,
  claim: DesignClaim,
  candidate: CandidateKey,
  customerConfirmed: boolean,
  product: string,
): TechnicalCheck {
  const check: TechnicalCheck = {
    requirementId: requirement.id,
    candidate,
    label: requirement.label,
    status: "unverified",
    fatal: false,
    expected: expectedText(requirement),
    observed: claim.value,
    reason: "",
  };
  const failed = (reason: string): TechnicalCheck => ({
    ...check,
    status: "failed",
    fatal: requirement.critical,
    reason,
  });
  const unknown = (reason: string): TechnicalCheck => ({ ...check, reason });
  if (requirement.kind === "manual" || requirement.source === "unknown")
    return unknown("根拠付きの定量条件がなく、自動成立判定できません。");
  if (
    (requirement.min !== undefined && !Number.isFinite(requirement.min)) ||
    (requirement.max !== undefined && !Number.isFinite(requirement.max)) ||
    (requirement.min !== undefined &&
      requirement.max !== undefined &&
      requirement.min > requirement.max)
  )
    return unknown(
      "要求側の境界値が不正・矛盾しています。顧客へ再確認してください。",
    );
  if (!claim.value.trim())
    return unknown("提案構成の能力値・対応I/Fが未入力です。");
  if (requirement.kind === "interface") {
    const proposed = claim.value.split(/[;,、/+]+/).map(normalizeInterface);
    if (
      !proposed.length ||
      proposed.some((value) => !knownInterfaces.has(value))
    )
      return unknown("I/F表記を自動照合できません。規格名を明示してください。");
    if (!requirement.interfaces?.length)
      return unknown("必要なI/Fが未確定です。");
    if (
      requirement.interfaces.some(
        (value) => !proposed.includes(normalizeInterface(value)),
      )
    )
      return failed(
        "要求するI/Fを満たしていません。物理層や類似名称だけでは代替できません。",
      );
  } else {
    const observed =
      requirement.kind === "coverage"
        ? parseRange(claim.value)
        : (() => {
            const quantity = parseQuantity(claim.value);
            return quantity
              ? {
                  min: quantity.value,
                  max: quantity.value,
                  dimension: quantity.dimension,
                }
              : null;
          })();
    if (!observed)
      return unknown(
        "数値・単位を一意に読めません。数値と単位、範囲なら18..30 Vの形式で入力してください。",
      );
    if (!requirement.unit || !units[requirement.unit])
      return unknown("要求側の単位を自動判定できません。");
    if (observed.dimension !== units[requirement.unit][0])
      return failed("要求と提案値の物理量（単位の次元）が異なります。");
    if (observed.min > observed.max)
      return failed("能力値の下限が上限を超えています。");
    if (
      ["time", "frequency", "channels"].includes(observed.dimension) &&
      observed.min < 0
    )
      return failed("時間・周波数・チャネル数に負の能力値を指定できません。");
    if (
      observed.dimension === "channels" &&
      (!Number.isInteger(observed.min) || !Number.isInteger(observed.max))
    )
      return failed("チャネル数は整数で指定してください。");
    const scale = units[requirement.unit][1];
    const lower =
      requirement.min === undefined ? undefined : requirement.min * scale;
    const upper =
      requirement.max === undefined ? undefined : requirement.max * scale;
    const tolerance =
      Math.max(
        Math.abs(lower ?? 0),
        Math.abs(upper ?? 0),
        Math.abs(observed.min),
        Math.abs(observed.max),
        Number.MIN_VALUE,
      ) *
      Number.EPSILON *
      8;
    if (
      requirement.kind === "maximum" &&
      upper !== undefined &&
      observed.max > upper + tolerance
    )
      return failed("提案値が要求上限を超えています。");
    if (
      requirement.kind === "minimum" &&
      lower !== undefined &&
      observed.min < lower - tolerance
    )
      return failed("提案値が要求下限に届いていません。");
    if (
      requirement.kind === "coverage" &&
      lower !== undefined &&
      upper !== undefined &&
      (observed.min > lower + tolerance || observed.max < upper - tolerance)
    )
      return failed("提案構成の動作範囲が顧客の要求範囲を包含していません。");
    if (
      (requirement.kind === "maximum" && upper === undefined) ||
      (requirement.kind === "minimum" && lower === undefined) ||
      (requirement.kind === "coverage" &&
        (lower === undefined || upper === undefined))
    )
      return unknown("要求の境界値が未定義です。");
  }
  if (!customerConfirmed)
    return unknown(
      "顧客条件が未確認または仮定です。数値一致だけでは成立扱いにしません。",
    );
  if (!product.trim())
    return unknown("この能力値が対応する製品・構成の識別情報がありません。");
  if (!hasEvidence(claim.citation))
    return unknown(
      "候補の根拠URL・該当箇所・確認日・照合申告が不足しています。",
    );
  return {
    ...check,
    status: "confirmed",
    reason:
      "記録された顧客条件と照合申告付きの能力値が一致。原典の真偽・実機・構成全体の成立は別途確認が必要です。",
  };
}
export function assessWorkflow(state: WorkflowState): TechnicalAssessment {
  const requirements = requirementsFor(state);
  const known = coveredTopics(state);
  const checks = requirements.flatMap((requirement) =>
    (["ti", "competitor"] as CandidateKey[]).map((candidate) => {
      const entry = state.entries[requirement.id] ?? emptyEntry(requirement);
      const confirmed =
        entry.knowledge === "confirmed" &&
        (requirement.public || known.includes(requirement.topicId));
      return checkClaim(
        requirement,
        requirement.id === "migration-budget"
          ? state.comparison.migration[candidate]
          : entry[candidate],
        candidate,
        confirmed,
        state.products[candidate],
      );
    }),
  );
  const selected =
    state.decision === "switch"
      ? "ti"
      : state.decision === "keep"
        ? "competitor"
        : null;
  const selectedChecks = checks.filter((check) => check.candidate === selected);
  const omissions = [
    ...new Set([
      ...requirements
        .filter(
          (requirement) =>
            !requirement.public && !known.includes(requirement.topicId),
        )
        .map((requirement) => requirement.id),
      ...state.profile.topics
        .filter((topic) => !known.includes(topic.id))
        .map((topic) => topic.id),
    ]),
  ];
  const unresolved = requirements
    .filter(
      (requirement) =>
        state.entries[requirement.id]?.knowledge !== "confirmed" ||
        requirement.source === "unknown",
    )
    .map((requirement) => requirement.id);
  const fatal = selectedChecks.some((check) => check.fatal);
  const criticalUnknown = selectedChecks.some(
    (check) =>
      check.status === "unverified" &&
      requirements.find((requirement) => requirement.id === check.requirementId)
        ?.critical,
  );
  const status = selectedChecks.some((check) => check.status === "failed")
    ? "failed"
    : selectedChecks.length > 0 &&
        selectedChecks.every((check) => check.status === "confirmed")
      ? "confirmed"
      : "unverified";
  const totalImportance = state.profile.topics.reduce(
    (sum, topic) => sum + topic.importance,
    0,
  );
  const hearingCoverage = totalImportance
    ? Math.round(
        (state.profile.topics
          .filter((topic) => known.includes(topic.id))
          .reduce((sum, topic) => sum + topic.importance, 0) /
          totalImportance) *
          100,
      )
    : 0;
  const comparisonComplete = comparisonMetrics.every((metric) =>
    (["ti", "competitor"] as CandidateKey[]).every(
      (candidate) =>
        state.comparison[metric.id][candidate].value.trim() &&
        hasEvidence(state.comparison[metric.id][candidate].citation),
    ),
  );
  const migrationKnown = (["ti", "competitor"] as CandidateKey[]).every(
    (candidate) => !!state.comparison.migration[candidate].value.trim(),
  );
  const errors: TechnicalAssessment["errors"] = [];
  if (status === "failed") errors.push("technical");
  if (
    omissions.length ||
    state.profile.topics.some(
      (topic) => topic.importance >= 3 && !known.includes(topic.id),
    )
  )
    errors.push("hearing");
  if (
    !selected ||
    selectedChecks.some((check) => check.status === "unverified")
  )
    errors.push("evidence");
  if (
    !comparisonComplete ||
    state.rationale.trim().length < 20 ||
    !state.products.ti.trim() ||
    !state.products.competitor.trim()
  )
    errors.push("competition");
  if (
    !migrationKnown ||
    selectedChecks.some(
      (check) =>
        check.requirementId === "migration-budget" && check.status === "failed",
    )
  )
    errors.push("migration");
  const scoreCap = fatal
    ? 20
    : status === "failed" || errors.includes("hearing")
      ? 35
      : !selected || criticalUnknown || status === "unverified"
        ? 45
        : 60;
  return {
    engineVersion: 1,
    status,
    checks,
    omissions,
    unresolved,
    coveredTopicIds: known,
    hearingCoverage,
    scoreCap,
    errors,
    decisionFeedback:
      state.decision === "keep"
        ? "現行品維持も合理的な選択です。現行構成の成立条件と、切替効果・移行費用の根拠を確認してください。"
        : state.decision === "switch"
          ? "切替の優位性は型番だけでは確定しません。必要条件・BOM・移行工数・開発リスク・供給の根拠を同条件で比較してください。"
          : "選定保留を記録しました。確認不足を解消する質問・評価計画を提案してください。",
  };
}
