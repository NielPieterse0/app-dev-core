import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  evaluateBranchProtection,
  evaluateDependabotConfig,
  evaluateDeviationExpiries,
  evaluateHostedChecks,
  evaluateSecurityAnalysis,
  evaluateWorkflowPermissions,
  type BranchProtectionPayload,
  type CheckRunsPayload,
  type ReleaseCheckResult,
  type RepoMetadataPayload,
  type State,
  type WorkflowPermissionsPayload,
} from "./lib/release-check.js";

const results: ReleaseCheckResult[] = [];

const structure = spawnSync("node", ["./node_modules/tsx/dist/cli.mjs", "./scripts/verify-structure.ts"], {
  stdio: "pipe",
  encoding: "utf8",
});

results.push(
  structure.status === 0
    ? { rule: "LOCAL/structure", state: "passed" }
    : {
        rule: "LOCAL/structure",
        state: "failed",
        detail: "verify-structure failed. Run npm run verify first.",
      }
);

const envExample = existsSync(".env.example") ? readFileSync(".env.example", "utf8") : "";
const hasBackend = /SUPABASE|API_URL|DATABASE/i.test(envExample);
const manifest = existsSync("app-dev.manifest.json")
  ? JSON.parse(readFileSync("app-dev.manifest.json", "utf8"))
  : {};

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

results.push(evaluateDeviationExpiries(manifest));

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

  const branchProtection = spawnSync("gh", ["api", `repos/${slug}/branches/${defaultBranch}/protection`], {
    encoding: "utf8",
  });

  results.push(
    evaluateDependabotConfig(
      existsSync(".github/dependabot.yml") ? readFileSync(".github/dependabot.yml", "utf8") : null
    )
  );

  if (branchProtection.status !== 0) {
    return {
      rule: "R08",
      state: "failed",
      detail: "main branch protection is missing.",
    };
  }

  results.push(
    evaluateBranchProtection(JSON.parse(branchProtection.stdout) as BranchProtectionPayload)
  );

  const workflowPermissions = spawnSync("gh", ["api", `repos/${slug}/actions/permissions/workflow`], {
    encoding: "utf8",
  });

  if (workflowPermissions.status !== 0) {
    return {
      rule: "R08",
      state: "failed",
      detail: "Unable to read repository workflow permissions.",
    };
  }

  results.push(
    evaluateWorkflowPermissions(JSON.parse(workflowPermissions.stdout) as WorkflowPermissionsPayload)
  );

  const repoMetadata = spawnSync("gh", ["api", `repos/${slug}`], {
    encoding: "utf8",
  });

  if (repoMetadata.status === 0) {
    results.push(...evaluateSecurityAnalysis(JSON.parse(repoMetadata.stdout) as RepoMetadataPayload));
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

  return evaluateHostedChecks(JSON.parse(checkRuns.stdout) as CheckRunsPayload);
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
