import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import {
  activateCounter,
  askCustomer,
  assessWorkflow,
  beginProposal,
  checkClaim,
  createWorkflow,
  emptyClaim,
  hasEvidence,
  parseQuantity,
  parseRange,
} from "../src/workflow";
import {
  comparisonMetrics,
  type Citation,
  type Requirement,
  type WorkflowState,
} from "../src/workflow-model";
import {
  virtualQuestions,
  competitionQuestions,
  reverseQuestions,
} from "../src/questions";
import {
  buildPrompt,
  evaluate,
  mergeLearningState,
  reviewPriority,
  validateLearningState,
} from "../src/learning";
import {
  dimensions,
  emptyAnswers,
  type Attempt,
  type Dataset,
} from "../src/model";
import {
  stableJson,
  validateReview,
  validateWorkflow,
} from "../src/workflow-validation";
import { caseEvidence } from "../src/evidence";

const proof: Citation = {
  url: "https://example.org/fictional-test-report",
  excerpt: "テスト専用の架空測定記録。負荷と周囲温度を固定して構成全体を照合。",
  checkedAt: "2026-10-19",
  reviewed: true,
};
const maximum: Requirement = {
  id: "cycle",
  topicId: "cycle",
  label: "制御周期",
  kind: "maximum",
  max: 50,
  unit: "us",
  critical: true,
  public: true,
  source: "scenario",
  context: "架空条件",
};
function check(value: string, requirement = maximum, citation = proof) {
  return checkClaim(
    requirement,
    { value, citation },
    "ti",
    true,
    "テスト用架空構成",
  );
}
function confirmedWorkflow(): WorkflowState {
  let state = createWorkflow(virtualQuestions[0]);
  for (const topic of state.profile.topics)
    state = askCustomer(state, topic.question, "2026-10-19T00:00:00Z");
  state = beginProposal(state, "2026-10-19T00:01:00Z");
  state.products = { ti: "テスト用構成TI", competitor: "テスト用現行構成" };
  state.decision = "switch";
  state.rationale =
    "同じ負荷と温度条件の評価記録を比較して、移行費用と納期も含めて選定する。";
  for (const [id, value] of Object.entries({
    cycle: "0.05 ms",
    input: "18..30 V",
    communication: "CAN FD",
  })) {
    state.entries[id].ti = { value, citation: { ...proof } };
    state.entries[id].competitor = { value, citation: { ...proof } };
  }
  for (const metric of comparisonMetrics)
    for (const candidate of ["ti", "competitor"] as const)
      state.comparison[metric.id][candidate] = {
        value:
          metric.id === "migration"
            ? "20時間"
            : "架空の比較条件・同数量・同納期",
        citation: { ...proof },
      };
  return state;
}
function makeAttempt(workflow?: WorkflowState): Attempt {
  const question = virtualQuestions[0];
  const answers = Object.fromEntries(
    dimensions.map((dimension) => [
      dimension.id,
      `${question.rubric[dimension.id].topics.flat().join("、")}。顧客条件を満たす必要があるため、同一の負荷・温度条件で最悪値を実測し比較検証します。未確認の値は顧客へ質問して確認し、合格基準と移行工数を合意します。`,
    ]),
  ) as ReturnType<typeof emptyAnswers>;
  const assessment = workflow ? assessWorkflow(workflow) : undefined;
  return {
    id: crypto.randomUUID(),
    question,
    answers,
    evaluations: evaluate(question, answers, assessment),
    createdAt: "2026-10-19T00:00:00Z",
    selfRating: 3,
    followup: "",
    revealedStage: 0,
    ...(workflow ? { workflow, assessment } : {}),
  };
}
describe("quantities and case-specific feasibility", () => {
  it.each([
    "50us",
    "50 μs",
    "50µs",
    "0.05 ms",
    "0.00005 s",
    "50000 ns",
    "5e-5 s",
  ])("accepts equivalent boundary %s", (value) => {
    expect(check(value).status).toBe("confirmed");
  });
  it.each(["50.001 us", "0.051 ms", "1 s", "50 V", "-1 us"])(
    "rejects contradictory %s",
    (value) => {
      expect(check(value)).toMatchObject({ status: "failed", fatal: true });
    },
  );
  it.each([
    "50",
    "NaN us",
    "Infinity us",
    "1e999 s",
    "50 bananas",
    "たぶん50us",
    "50..60us",
  ])("does not guess ambiguous input %s", (value) => {
    expect(check(value).status).toBe("unverified");
  });
  it("compares complete operating ranges, including negative temperature", () => {
    const range: Requirement = {
      ...maximum,
      kind: "coverage",
      min: -20,
      max: 85,
      unit: "°C",
    };
    expect(check("-20..85 °C", range).status).toBe("confirmed");
    expect(check("-40..125℃", range).status).toBe("confirmed");
    expect(check("0..85 °C", range).status).toBe("failed");
    expect(check("-20..84.9 °C", range).status).toBe("failed");
    expect(check("85..-20 °C", range).status).toBe("failed");
  });
  it("converts voltage and minimum frequency without confusing dimensions", () => {
    const range: Requirement = {
      ...maximum,
      kind: "coverage",
      min: 18,
      max: 30,
      unit: "V",
    };
    expect(check("18000..30000 mV", range).status).toBe("confirmed");
    expect(check("24 V", range).status).toBe("failed");
    const minimum: Requirement = {
      ...maximum,
      kind: "minimum",
      min: 1000,
      max: undefined,
      unit: "Hz",
    };
    expect(check("1 kHz", minimum).status).toBe("confirmed");
    expect(check("999.99 Hz", minimum).status).toBe("failed");
    expect(check("1 ms", minimum).status).toBe("failed");
    expect(parseQuantity("3.3V")?.value).toBe(3.3);
    expect(parseRange("18 V..30 V")).toMatchObject({ min: 18, max: 30 });
  });
  it("normalizes protocol aliases but does not equate physical layers and protocols", () => {
    const protocol: Requirement = {
      ...maximum,
      kind: "interface",
      interfaces: ["CAN FD"],
    };
    expect(check("CAN-FD", protocol).status).toBe("confirmed");
    expect(check("CAN", protocol).status).toBe("failed");
    expect(check("よく分からない", protocol).status).toBe("unverified");
    expect(
      check("Ethernet", { ...protocol, interfaces: ["EtherCAT"] }).status,
    ).toBe("failed");
    expect(check("RS-485", { ...protocol, interfaces: ["UART"] }).status).toBe(
      "failed",
    );
    expect(
      check("Bluetooth LE", { ...protocol, interfaces: ["BLE"] }).status,
    ).toBe("confirmed");
  });
  it.each(["url", "excerpt", "checkedAt", "reviewed"] as const)(
    "requires evidence field %s for a passing claim",
    (key) => {
      const missing = { ...proof, [key]: key === "reviewed" ? false : "" };
      expect(check("50us", maximum, missing).status).toBe("unverified");
    },
  );
  it("does not upgrade an unchecked URL, invalid date, assumption, missing product or unknown requirement", () => {
    expect(hasEvidence({ ...proof, url: "javascript:alert(1)" })).toBe(false);
    expect(hasEvidence({ ...proof, checkedAt: "2026-02-31" })).toBe(false);
    expect(
      checkClaim(
        maximum,
        { value: "50us", citation: proof },
        "ti",
        false,
        "構成",
      ).status,
    ).toBe("unverified");
    expect(
      checkClaim(maximum, { value: "50us", citation: proof }, "ti", true, "")
        .status,
    ).toBe("unverified");
    expect(check("50us", { ...maximum, source: "unknown" }).status).toBe(
      "unverified",
    );
    expect(check("50us", { ...maximum, kind: "manual" }).status).toBe(
      "unverified",
    );
  });
});
describe("interview, counterexamples, decisions and score protection", () => {
  it("detects a migration budget violation even if the electrical design passes", () => {
    const state = confirmedWorkflow();
    state.comparison.migration.ti.value = "41 h";
    expect(assessWorkflow(state)).toMatchObject({
      status: "failed",
      scoreCap: 35,
    });
    expect(assessWorkflow(state).errors).toContain("migration");
    state.comparison.migration.ti.value = "40 h";
    expect(assessWorkflow(state).status).toBe("confirmed");
  });
  it("evaluates a fully documented feasible design within the stated scope", () => {
    const assessment = assessWorkflow(confirmedWorkflow());
    expect(assessment).toMatchObject({
      status: "confirmed",
      hearingCoverage: 100,
      scoreCap: 60,
      errors: [],
      omissions: [],
      unresolved: [],
    });
  });
  it("caps even well-written answers when a selected design has a fatal contradiction", () => {
    const workflow = confirmedWorkflow();
    workflow.entries.cycle.ti.value = "1 ms";
    const attempt = makeAttempt(workflow);
    expect(attempt.assessment).toMatchObject({
      status: "failed",
      scoreCap: 20,
    });
    expect(attempt.assessment?.errors).toContain("technical");
    expect(
      attempt.evaluations.reduce((sum, item) => sum + item.points, 0),
    ).toBeLessThanOrEqual(20);
  });
  it("permits keeping the incumbent when the TI proposal is infeasible", () => {
    const workflow = confirmedWorkflow();
    workflow.entries.cycle.ti.value = "1 ms";
    workflow.decision = "keep";
    expect(assessWorkflow(workflow)).toMatchObject({
      status: "confirmed",
      scoreCap: 60,
      errors: [],
    });
    expect(
      assessWorkflow(workflow).checks.find(
        (item) => item.candidate === "ti" && item.requirementId === "cycle",
      )?.status,
    ).toBe("failed");
  });
  it("records hearing omissions at the moment of proposal, even if resolved later", () => {
    const state = beginProposal(createWorkflow(virtualQuestions[0]));
    expect(state.uncheckedAtProposal).toEqual(
      expect.arrayContaining([
        "input",
        "communication",
        "migration",
        "commercial",
      ]),
    );
    const updated = askCustomer(
      state,
      "入力電圧と通信、移行工数、BOMと納期は？",
    );
    expect(updated.uncheckedAtProposal).toEqual(state.uncheckedAtProposal);
    expect(assessWorkflow(updated).omissions).not.toContain("input");
    expect(state.entries.input.knowledge).toBe("unknown");
    expect(updated.entries.input.knowledge).toBe("confirmed");
  });
  it("does not reward repeated questions, and treats vague questions as unresolved", () => {
    let state = createWorkflow(virtualQuestions[0]);
    state = askCustomer(state, "入力電圧の範囲は？");
    const initial = assessWorkflow(state).hearingCoverage;
    for (let index = 0; index < 10; index += 1)
      state = askCustomer(state, "入力電圧の範囲は？");
    state = askCustomer(state, "どうすればいいですか？");
    expect(assessWorkflow(state).hearingCoverage).toBe(initial);
    expect(state.interview.at(-1)?.topicIds).toEqual([]);
  });
  it("does not accept self-marking an unasked hidden requirement as confirmed", () => {
    const state = createWorkflow(virtualQuestions[0]);
    state.decision = "switch";
    state.products.ti = "構成A";
    state.entries.input.knowledge = "confirmed";
    state.entries.input.ti = { value: "18..30V", citation: proof };
    expect(
      assessWorkflow(state).checks.find(
        (item) => item.requirementId === "input" && item.candidate === "ti",
      )?.status,
    ).toBe("unverified");
  });
  it("re-evaluates new operating conditions without rewriting the earlier snapshot", () => {
    const before = confirmedWorkflow();
    const serialized = JSON.stringify(before);
    const after = activateCounter(before);
    expect(assessWorkflow(before).status).toBe("confirmed");
    expect(assessWorkflow(after).status).toBe("unverified");
    after.entries["counter-temperature"].ti = {
      value: "0..85 °C",
      citation: proof,
    };
    expect(assessWorkflow(after).status).toBe("failed");
    expect(JSON.stringify(before)).toBe(serialized);
    expect(activateCounter(after)).toBe(after);
  });
  it("classifies evidence, comparison and migration deficiencies separately", () => {
    const state = confirmedWorkflow();
    state.entries.cycle.ti.citation.reviewed = false;
    state.comparison.bom.ti = emptyClaim();
    state.comparison.migration.competitor = emptyClaim();
    const assessment = assessWorkflow(state);
    expect(assessment.errors).toEqual(
      expect.arrayContaining(["evidence", "competition", "migration"]),
    );
    expect(assessment.errors).not.toContain("technical");
  });
  it("defines hidden conditions for every fictional case", () => {
    for (const question of [...virtualQuestions, ...competitionQuestions])
      expect(
        createWorkflow(question).profile.requirements.length,
      ).toBeGreaterThan(0);
  });
  it.skipIf(!existsSync("public/data/notion.json"))(
    "keeps real customer requirements unknown without inventing details",
    async () => {
      const dataset = JSON.parse(
        await readFile("public/data/notion.json", "utf8"),
      ) as Dataset;
      const serialized = JSON.stringify(dataset);
      const real = reverseQuestions(dataset);
      expect(real).toHaveLength(351);
      const state = createWorkflow(real[0]);
      expect(state.profile.fictional).toBe(false);
      expect(state.profile.counter).toBeNull();
      expect(
        state.profile.requirements.every((item) => item.source === "unknown"),
      ).toBe(true);
      expect(assessWorkflow(state).status).toBe("unverified");
      expect(
        caseEvidence(real[0].record!).adoptionConfirmation.externallyVerified,
      ).toBe(false);
      expect(
        caseEvidence(real[0].record!).adoptionReason.classification,
      ).not.toBe("fact");
      expect(JSON.stringify(dataset)).toBe(serialized);
    },
  );
});
describe("old history compatibility and review round trips", () => {
  it("preserves old scores and snapshots while round-tripping new workflows and reviews", () => {
    const legacy = makeAttempt();
    const before = JSON.stringify(legacy);
    const current = makeAttempt(confirmedWorkflow());
    current.externalReviews = [
      validateReview(
        {
          schemaVersion: 1,
          attemptId: current.id,
          source: "ChatGPT",
          content: "条件付きの参考レビュー。外部検証未実施。",
          reviewedAt: "2026-10-19",
        },
        current.id,
      ),
    ];
    const imported = validateLearningState(
      JSON.parse(
        JSON.stringify({
          schemaVersion: 1,
          attempts: [legacy, current],
          favorites: [legacy.question.id],
        }),
      ),
    );
    expect(JSON.stringify(imported.attempts[0])).toBe(before);
    expect(imported.attempts[1]).toEqual(current);
    expect(validateLearningState(JSON.parse(stableJson(imported)!))).toEqual(
      imported,
    );
    expect(mergeLearningState(imported, imported).attempts).toHaveLength(2);
  });
  it("rejects malformed state, tampered feasibility and cross-attempt reviews", () => {
    expect(() => validateWorkflow({ version: 1 })).toThrow();
    const current = makeAttempt(confirmedWorkflow());
    current.assessment!.status = "failed";
    expect(() =>
      validateLearningState({
        schemaVersion: 1,
        attempts: [current],
        favorites: [],
      }),
    ).toThrow();
    expect(() =>
      validateReview(
        {
          schemaVersion: 1,
          attemptId: "other",
          source: "ChatGPT",
          reviewedAt: "2026-10-19",
          content: "review",
        },
        current.id,
      ),
    ).toThrow();
    expect(() =>
      validateReview(
        {
          schemaVersion: 1,
          attemptId: current.id,
          source: "ChatGPT",
          reviewedAt: "2026-02-31",
          content: "review",
        },
        current.id,
      ),
    ).toThrow();
  });
  it("includes unresolved evidence and review exchange schema in the ChatGPT prompt", () => {
    const state = beginProposal(createWorkflow(virtualQuestions[0]));
    const current = makeAttempt(state);
    const prompt = buildPrompt(current);
    for (const expected of [
      "uncheckedAtProposal",
      "unverifiedConditions",
      "採用確認と採用理由",
      "確認日",
      "attemptId",
      current.id,
      "ChatGPT",
      "移行",
    ])
      expect(prompt).toContain(expected);
  });
  it("prioritizes a technical violation for targeted repeat practice", () => {
    const state = confirmedWorkflow();
    state.entries.cycle.ti.value = "1ms";
    const failed = makeAttempt(state);
    const legacy = makeAttempt();
    expect(reviewPriority(virtualQuestions[0], [failed])).toBeGreaterThan(
      reviewPriority(virtualQuestions[0], [legacy]),
    );
  });
});
