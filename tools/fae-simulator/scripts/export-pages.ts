import { copyFile, lstat, mkdir, realpath } from "node:fs/promises";
import { join, resolve } from "node:path";

const repository = process.argv[2];
if (!repository)
  throw new Error("Usage: npm run export:pages -- /path/to/ando_profile");
await lstat(join(repository, ".git"));
await lstat(join(repository, "_config.yml"));
const source = await realpath(".");
const destination = resolve(repository, "tools/fae-simulator");
async function copy(relative: string) {
  const original = join(source, relative);
  const target = join(destination, relative);
  const stat = await lstat(original);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error(`Unexpected source: ${relative}`);
  if (original === target) return;
  await mkdir(resolve(target, ".."), { recursive: true });
  await copyFile(original, target);
}
for (const file of [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "index.html",
  ".gitignore",
  "public/sw.js",
])
  await copy(file);
for (const file of [
  "src/App.tsx",
  "src/curriculum.ts",
  "src/scope-counts.ts",
  "src/ic-exercises.ts",
  "src/bundled-notion.ts",
  "src/data/curriculum.json",
  "src/data/notion-training.json",
  "src/ic-reference.ts",
  "src/bundled-ic.ts",
  "src/data/ic-reference.json",
  "src/IcLibraryPanel.tsx",
  "src/LearningPath.tsx",
  "src/WorkflowPanel.tsx",
  "src/evidence.ts",
  "src/importer.ts",
  "src/learning.ts",
  "src/main.tsx",
  "src/model.ts",
  "src/questions.ts",
  "src/scenarios.ts",
  "src/short-learning.ts",
  "src/short-model.ts",
  "src/short-questions.ts",
  "src/decision-questions.ts",
  "src/short.css",
  "src/storage.ts",
  "src/style.css",
  "src/workflow-model.ts",
  "src/workflow-validation.ts",
  "src/workflow.css",
  "src/workflow.ts",
  "scripts/build-public.ts",
  "scripts/export-pages.ts",
  "scripts/import-notion.ts",
  "scripts/import-ic.ts",
  "scripts/compile-curriculum.ts",
  "scripts/compile-notion-training.ts",
  "tests/curriculum.test.ts",
  "tests/browser_catalogue.py",
  "tests/browser_state.py",
  "tests/decision-learning.test.ts",
  "tests/ic-reference.test.ts",
  "tests/browser_tempo.py",
  "tests/browser_workflow.py",
  "tests/importer.test.ts",
  "tests/learning.test.ts",
  "tests/service-worker.test.ts",
  "tests/short-learning.test.ts",
  "tests/storage.test.ts",
  "tests/workflow.test.ts",
])
  await copy(file);
