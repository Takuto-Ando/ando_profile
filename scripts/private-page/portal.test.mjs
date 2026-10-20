import assert from "node:assert/strict";
import test from "node:test";
import { groupMaterials } from "../../assets/js/private-categories.js";
import { parseLibrary } from "../../assets/js/private-library.js";

test("hide only six quiz cards without removing documents or link targets", () => {
  const titles = [
    "TI クイズ一覧",
    "TI 用途・特徴クイズ",
    "TI デジタルセミナークイズ",
    "TI ブロック図・回路クイズ",
    "TI アナログセミナークイズ",
    "TI セミナークイズ",
    "TI Product Learning Lab",
    "TI デジタルセミナー",
    "TI PSDS 2026｜アナログ電源設計の学習ノート",
    "ブロック図で理解するTIの電子システム",
    "TI セミナー学習ノート",
    "業界と競合・キャリア",
  ];
  const entries = parseLibrary(
    JSON.stringify({
      type: "private-library",
      version: 1,
      documents: titles.map((title, index) => ({
        id: String(index),
        title,
        html: "<html><body>synthetic fixture</body></html>",
      })),
    }),
  );
  const groups = groupMaterials(entries);
  assert.equal(groups.length, 6);
  assert.deepEqual(
    groups.map((group) => group.entries.length),
    [1, 1, 1, 1, 1, 1],
  );
  assert.equal(entries.length, 12);
  assert.equal(
    entries.find((entry) => entry.id === "0").title,
    "TI クイズ一覧",
  );
  assert.equal(
    groupMaterials([{ title: "未登録の資料" }])[5].entries.length,
    1,
  );
});
