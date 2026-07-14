import { rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createTempDir, generateArchetype } from "./lib/archetype-generator.js";

function command(name: string) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function run(name: string, args: string[], cwd: string) {
  const result = spawnSync(command(name), args, {
    cwd,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) {
    throw new Error(`${name} ${args.join(" ")} failed to start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`${name} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

const archetype = readArg("--archetype") ?? "react-vite-capacitor";
const packageName = readArg("--name") ?? `clean-room-${archetype}`;
const appTitle = readArg("--title");
const keep = hasFlag("--keep-output");

const tempRoot = createTempDir("app-dev-core-archetype-");
const targetDir = join(tempRoot, packageName);

try {
  const generated = generateArchetype({
    archetype,
    appTitle,
    packageName,
    repoRoot: process.cwd(),
    targetDir,
  });

  run("npm", ["ci"], generated.targetDir);
  run("npx", ["playwright", "install", "--with-deps", "chromium"], generated.targetDir);
  run("npm", ["run", "verify"], generated.targetDir);

  console.log(
    JSON.stringify(
      {
        tool: "test-archetype",
        archetype,
        targetDir: generated.targetDir,
        e2e: "passed",
        verdict: "passed",
      },
      null,
      2
    )
  );
} finally {
  if (!keep) {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}
