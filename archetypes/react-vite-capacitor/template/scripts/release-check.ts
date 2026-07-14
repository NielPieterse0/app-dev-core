import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

type State = "passed" | "failed" | "not-applicable" | "not-run";

const results: { rule: string; state: State; detail?: string }[] = [];

const structure = spawnSync("node", ["./node_modules/tsx/dist/cli.mjs", "./scripts/verify-structure.ts"], {
  stdio: "pipe",
  encoding: "utf8",
});

results.push(
  structure.status === 0
    ? { rule: "R12/structure", state: "passed" }
    : {
        rule: "R12/structure",
        state: "failed",
        detail: "verify-structure failed. Run npm run verify first.",
      }
);

const envExample = existsSync(".env.example") ? readFileSync(".env.example", "utf8") : "";
const hasBackend = /SUPABASE|API_URL|DATABASE/i.test(envExample);

results.push(
  hasBackend
    ? {
        rule: "R17",
        state: "failed",
        detail:
          "A backend is configured but the archetype release gate is still a placeholder. Wire a real anonymous-write or auth/RLS check before release.",
      }
    : { rule: "R17", state: "not-applicable", detail: "No backend configured yet." }
);

function ghResult(): { rule: string; state: State; detail?: string } {
  const auth = spawnSync("gh", ["auth", "status"], { encoding: "utf8" });
  if (auth.status !== 0) {
    return {
      rule: "R08",
      state: "not-run",
      detail: "gh is unavailable or not authenticated.",
    };
  }

  const repo = spawnSync("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], {
    encoding: "utf8",
  });

  if (repo.status !== 0) {
    return {
      rule: "R08",
      state: "not-run",
      detail: "Not inside a pushed GitHub repository yet.",
    };
  }

  const slug = repo.stdout.trim();
  const protection = spawnSync("gh", ["api", `repos/${slug}/branches/main/protection`], {
    encoding: "utf8",
  });

  if (protection.status !== 0) {
    return {
      rule: "R08",
      state: "failed",
      detail: "main branch protection is missing.",
    };
  }

  const checkRuns = spawnSync(
    "gh",
    ["api", `repos/${slug}/commits/main/check-runs`, "-q", ".total_count"],
    { encoding: "utf8" }
  );

  const totalCount = Number.parseInt(checkRuns.stdout.trim() || "0", 10);

  return totalCount > 0
    ? { rule: "R08", state: "passed", detail: `${totalCount} hosted check-runs observed.` }
    : { rule: "R08", state: "failed", detail: "Hosted check-runs total_count is 0." };
}

results.push(ghResult());

const verdict = results.every((result) =>
  result.state === "passed" || result.state === "not-applicable"
) ? "passed" : "failed";

console.log(JSON.stringify({ tool: "release-check", verdict, results }, null, 2));

for (const result of results) {
  if (result.state !== "passed" && result.state !== "not-applicable") {
    console.error(`✗ ${result.rule} [${result.state}] ${result.detail ?? ""}`);
  }
}

process.exit(verdict === "passed" ? 0 : 1);
