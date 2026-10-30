import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";

const base = process.env.FAE_BASE_PATH ?? "/";
if (base !== "/" && !/^\/[A-Za-z0-9/_-]+\/$/.test(base))
  throw new Error(
    "FAE_BASE_PATH must be a root-relative directory ending in /.",
  );
const publicEdition = process.env.FAE_PUBLIC_EDITION === "1";
let outputDirectory = "dist";

export default defineConfig({
  base,
  publicDir: publicEdition ? false : "public",
  define: {
    "import.meta.env.VITE_PUBLIC_EDITION": JSON.stringify(
      publicEdition ? "true" : "false",
    ),
  },
  plugins: [
    react(),
    {
      name: "offline-cache",
      apply: "build",
      configResolved(config) {
        outputDirectory = config.build.outDir;
      },
      async closeBundle() {
        async function list(directory: string): Promise<string[]> {
          const entries = await readdir(directory, { withFileTypes: true });
          const results = await Promise.all(
            entries.map((entry) =>
              entry.isDirectory()
                ? list(`${directory}/${entry.name}`)
                : [`${directory}/${entry.name}`],
            ),
          );
          return results.flat();
        }
        const files = (await list(outputDirectory))
          .filter((file) => !file.endsWith("/sw.js"))
          .sort();
        const hash = createHash("sha256");
        for (const file of files) {
          hash.update(file);
          hash.update(await readFile(file));
        }
        const template = await readFile("public/sw.js", "utf8");
        await writeFile(
          join(outputDirectory, "sw.js"),
          template
            .replace(
              "__CACHE__",
              `fae-simulator-${createHash("sha256").update(base).digest("hex").slice(0, 8)}-${hash.digest("hex").slice(0, 16)}`,
            )
            .replace(
              "__PREFIX__",
              `fae-simulator-${createHash("sha256").update(base).digest("hex").slice(0, 8)}-`,
            )
            .replaceAll("__BASE__", base)
            .replace(
              "__ASSETS__",
              JSON.stringify([
                base,
                ...files.map(
                  (file) =>
                    base + relative(outputDirectory, file).split(sep).join("/"),
                ),
              ]),
            ),
        );
      },
    },
  ],
  server: { host: "127.0.0.1" },
});
