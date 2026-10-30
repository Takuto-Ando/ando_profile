import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";

const result = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "build", "--", "--outDir", "dist-public"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      FAE_PUBLIC_EDITION: "1",
      FAE_BASE_PATH:
        process.env.FAE_BASE_PATH ?? "/ando_profile/fae-simulator/",
    },
  },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
async function audit(directory: string, prefix = ""): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${path}`);
    if (entry.isDirectory() && path === "assets")
      await audit(`${directory}/${entry.name}`, "assets/");
    else if (
      !entry.isFile() ||
      !/^(?:index\.html|sw\.js|assets\/[\w.-]+\.(?:js|css))$/.test(path)
    )
      throw new Error(
        `Unexpected public output (publication stopped): ${path}`,
      );
  }
}
await audit("dist-public");
