import { spawnSync } from "node:child_process";

type Result = {
  name: string;
  state: "passed" | "failed";
  detail?: string;
};

const steps: { name: string; command: string[] }[] = [
  {
    name: "structure",
    command: ["node", "./node_modules/tsx/dist/cli.mjs", "./scripts/verify-structure.ts"],
  },
  {
    name: "typecheck",
    command: ["node", "./node_modules/typescript/bin/tsc", "--noEmit"],
  },
  {
    name: "lint",
    command: ["node", "./node_modules/eslint/bin/eslint.js", "."],
  },
  {
    name: "test",
    command: ["node", "./node_modules/vitest/vitest.mjs", "run", "--config", "./vitest.config.ts"],
  },
  {
    name: "build",
    command: ["node", "./node_modules/vite/bin/vite.js", "build"],
  },
];

const results: Result[] = [];

for (const step of steps) {
  const run = spawnSync(step.command[0]!, step.command.slice(1), {
    stdio: "pipe",
    encoding: "utf8",
  });

  results.push(
    run.status === 0
      ? { name: step.name, state: "passed" }
      : {
          name: step.name,
          state: "failed",
          detail: (run.stderr || run.stdout || "").slice(-2000),
        }
  );

  if (run.status !== 0) {
    break;
  }
}

const verdict = results.every((result) => result.state === "passed") ? "passed" : "failed";

console.log(
  JSON.stringify(
    {
      tool: "verify",
      verdict,
      results: results.map((result) => ({
        name: result.name,
        state: result.state,
      })),
    },
    null,
    2
  )
);

for (const result of results) {
  if (result.state !== "passed") {
    console.error(`\n✗ ${result.name}\n${result.detail ?? ""}`);
  }
}

process.exit(verdict === "passed" ? 0 : 1);
