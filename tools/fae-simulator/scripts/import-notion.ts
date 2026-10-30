import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { importFiles, type InputFile } from "../src/importer";

const input = resolve(process.argv[2] ?? "data/notion-export");
const output = resolve(process.argv[3] ?? "public/data");
async function collect(path: string, base: string): Promise<InputFile[]> {
  const { lstat } = await import("node:fs/promises");
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) return [];
  if (stat.isFile())
    return [
      {
        path: relative(base, path),
        bytes: new Uint8Array(await readFile(path)),
      },
    ];
  const files: InputFile[] = [];
  for (const entry of await readdir(path))
    files.push(...(await collect(join(path, entry), base)));
  return files;
}
try {
  const dataset = await importFiles(await collect(input, resolve(input, "..")));
  await mkdir(output, { recursive: true });
  await writeFile(
    join(output, "notion.json"),
    JSON.stringify(dataset, null, 2),
  );
  await writeFile(
    join(output, "import-report.json"),
    JSON.stringify(dataset.report, null, 2),
  );
  process.stdout.write(JSON.stringify(dataset.report, null, 2) + "\n");
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
