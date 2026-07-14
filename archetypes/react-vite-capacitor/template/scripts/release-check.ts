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

  const repo = spawnSync("gh", ["repo", "view", "--json", "nameWithOwner,defaultBranchRef"], {
    encoding: "utf8",
  });

  if (repo.status !== 0) {
    return {
      rule: "R08",
      state: "not-run",
      detail: "Not inside a pushed GitHub repository yet.",
    };
  }

  const repoInfo = JSON.parse(repo.stdout) as {
    defaultBranchRef?: { name?: string };
    nameWithOwner?: string;
  };

  const slug = repoInfo.nameWithOwner?.trim();
  const defaultBranch = repoInfo.defaultBranchRef?.name?.trim();

  if (!slug || !defaultBranch) {
    return {
      rule: "R08",
      state: "not-run",
      detail: "Unable to determine the GitHub repository or default branch.",
    };
  }

  const protection = spawnSync("gh", ["api", `repos/${slug}/branches/${defaultBranch}/protection`], {
    encoding: "utf8",
  });

  if (protection.status !== 0) {
    return {
      rule: "R08",
      state: "failed",
      detail: "main branch protection is missing.",
    };
  }

  const protectionInfo = JSON.parse(protection.stdout) as {
    required_status_checks?: {
      contexts?: string[];
      checks?: Array<{ context?: string }>;
    };
  };

  const requiredChecks = new Set([
    ...(protectionInfo.required_status_checks?.contexts ?? []),
    ...(protectionInfo.required_status_checks?.checks ?? []).flatMap((entry) =>
      entry.context ? [entry.context] : []
    ),
  ]);

  if (!requiredChecks.has("verify")) {
    return {
      rule: "R08",
      state: "failed",
      detail: `${defaultBranch} branch protection does not require the verify check.`,
    };
  }

  const headSha = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });

  if (headSha.status !== 0) {
    return {
      rule: "R08",
      state: "not-run",
      detail: "Unable to determine the current HEAD SHA.",
    };
  }

  const sha = headSha.stdout.trim();
  const checkRuns = spawnSync("gh", ["api", `repos/${slug}/commits/${sha}/check-runs`], {
    encoding: "utf8",
  });

  if (checkRuns.status !== 0) {
    return {
      rule: "R08",
      state: "not-run",
      detail: "Current HEAD is not yet visible to GitHub checks.",
    };
  }

  const checkRunInfo = JSON.parse(checkRuns.stdout) as {
    total_count?: number;
    check_runs?: Array<{
      name?: string;
      status?: string;
      conclusion?: string | null;
    }>;
  };

  if ((checkRunInfo.total_count ?? 0) === 0) {
    return {
      rule: "R08",
      state: "failed",
      detail: "Hosted check-runs total_count is 0 for the current HEAD commit.",
    };
  }

  const verifyRuns = (checkRunInfo.check_runs ?? []).filter((run) => run.name === "verify");

  if (verifyRuns.length === 0) {
    return {
      rule: "R08",
      state: "failed",
      detail: "No hosted verify check-run was found for the current HEAD commit.",
    };
  }

  const blockingVerifyRun = verifyRuns.find(
    (run) => run.status !== "completed" || run.conclusion !== "success"
  );

  return blockingVerifyRun
    ? {
        rule: "R08",
        state: "failed",
        detail: `Hosted verify for the current HEAD is ${blockingVerifyRun.status}/${blockingVerifyRun.conclusion ?? "pending"}.`,
      }
    : {
        rule: "R08",
        state: "passed",
        detail: `Hosted verify is green for ${sha.slice(0, 7)} and required on ${defaultBranch}.`,
      };
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
