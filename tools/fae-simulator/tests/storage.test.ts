import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import {
  loadLearning,
  saveLearning,
  loadDataset,
  saveDataset,
} from "../src/storage";
import { importFiles } from "../src/importer";
import { shortQuestions } from "../src/short-questions";
import { gradeShort } from "../src/short-learning";

it("persists history/favorites and keeps them after replacing the dataset", async () => {
  const initial = await loadLearning();
  expect(initial.attempts).toEqual([]);
  await saveLearning({ ...initial, favorites: ["virtual-servo"] });
  const dataset = await importFiles([
    {
      path: "case.csv",
      bytes: new TextEncoder().encode("事業名,会社名,課題\nA,C,制御"),
    },
  ]);
  await saveDataset(dataset);
  expect((await loadDataset())?.records).toHaveLength(1);
  expect((await loadLearning()).favorites).toEqual(["virtual-servo"]);
  await saveDataset({ ...dataset, importedAt: "2026-10-19T00:00:00Z" });
  expect((await loadLearning()).favorites).toEqual(["virtual-servo"]);
});

it("stores optional short history without migrating or replacing existing records", async () => {
  const before = await loadLearning();
  const question = shortQuestions[0];
  const answers = {
    selection: question.selection.correctId,
    reason: null,
    proposal: "",
  };
  const attempt = {
    id: "short-persist",
    question,
    answers,
    result: gradeShort(question, answers),
    hintsUsed: 3,
    selfAssessment: "unclear" as const,
    createdAt: "2026-10-19T00:00:00Z",
  };
  await saveLearning({ ...before, shortAttempts: [attempt] });
  const after = await loadLearning();
  expect(after.shortAttempts).toEqual([attempt]);
  expect(after.attempts).toEqual(before.attempts);
  expect(after.favorites).toEqual(before.favorites);
  expect((await loadDataset())?.records).toHaveLength(1);
});
