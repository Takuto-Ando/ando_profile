import { readFile, mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { importIcWorkbook } from "../src/ic-reference";

const input = process.argv[2];
if (!input)
  throw new Error("Usage: npm run import:ic -- workbook.xlsx [output.json]");
const output = resolve(process.argv[3] ?? "public/data/ic-reference.json");
const library = await importIcWorkbook({
  path: basename(input),
  bytes: new Uint8Array(await readFile(input)),
});
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(library, null, 2));
process.stdout.write(
  `${library.entries.length} IC references normalized. Output is private/local: ${output}\n`,
);
