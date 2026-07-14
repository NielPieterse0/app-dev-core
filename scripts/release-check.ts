import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  type BranchProtectionPayload,
  type HostedCommit,
  type RepoMetadataPayload,
  type ReleaseCheckResult,
  type State,
  type WorkflowPermissionsPayload,
  evaluateBranchProtection,
  evaluateCommitPrivacy,
  evaluateDependabotConfig,
  evaluateHostedChecks,
  evaluateSecurityAnalysis,
  evaluateSecurityPolicyFile,
  evaluateWorkflowPermissions,
} from "./lib/release-check.js";

type CommandResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

const results: ReleaseCheckResult[] = [];

function run(command: string, args: string[]): CommandResult {
  const result = spawnSync(command, args, {
    stdio: "pipe",
    encoding: "utf8",
  });

  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function pushResult(rule: string, state: State, detail?: string) {
  results.push({ rule, state, detail });
}

function readOptionalFile(path: string) {
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function parseJson<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} returned invalid JSON: ${message}`);
  }
}

function ghApi<T>(path: string): T {
  const api = run("gh", ["api", path]);
  if (api.status !== 0) {
    const detail = api.stderr.trim() || api.stdout.trim() || `gh api ${path} failed.`;
    throw new Error(detail);
  }
  return parseJson<T>(api.stdout, `gh api ${path}`);
}

function detectGitHubSlug() {
  const repo = run("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"]);

  if (repo.status !== 0) {
    throw new Error("Not inside a pushed GitHub repository yet.");
  }

  const slug = repo.stdout.trim();
  if (!slug) {
    throw new Error("Unable to determine GitHub repository slug.");
  }

  return slug;
}

function listHostedCommits(slug: string, branch: string): HostedCommit[] {
  const commits: HostedCommit[] = [];

  for (let page = 1; page < 50; page += 1) {
    const response = ghApi<HostedCommit[]>(
      `repos/${slug}/commits?sha=${encodeURIComponent(branch)}&per_page=100&page=${page}`
    );

    if (response.length === 0) {
      break;
    }

    commits.push(...response);

    if (response.length < 100) {
      break;
    }
  }

  return commits;
}

results.push(evaluateSecurityPolicyFile(existsSync("SECURITY.md")));
results.push(evaluateDependabotConfig(readOptionalFile(".github/dependabot.yml")));

const auth = run("gh", ["auth", "status"]);
if (auth.status !== 0) {
  pushResult("R08/github-auth", "not-run", "gh is unavailable or not authenticated.");
  pushResult("R05/hosted-check-runs", "not-run", "Hosted check-runs require GitHub authentication.");
  pushResult("PUBLIC/commit-email-privacy", "not-run", "Hosted commit privacy check requires GitHub authentication.");
} else {
  try {
    const slug = detectGitHubSlug();
    const repo = ghApi<RepoMetadataPayload>(`repos/${slug}`);
    const defaultBranch = repo.default_branch?.trim() || "main";

    const protection = ghApi<BranchProtectionPayload>(`repos/${slug}/branches/${defaultBranch}/protection`);
    results.push(evaluateBranchProtection(protection));

    const workflowPermissions = ghApi<WorkflowPermissionsPayload>(
      `repos/${slug}/actions/permissions/workflow`
    );
    results.push(evaluateWorkflowPermissions(workflowPermissions));

    const checkRuns = ghApi<{ total_count?: number }>(
      `repos/${slug}/commits/${defaultBranch}/check-runs`
    );
    results.push(evaluateHostedChecks(Number.parseInt(String(checkRuns.total_count ?? 0), 10)));

    results.push(...evaluateSecurityAnalysis(repo));

    const privateVulnerabilityReporting = ghApi<{ enabled?: boolean }>(
      `repos/${slug}/private-vulnerability-reporting`
    );
    results.push(
      privateVulnerabilityReporting.enabled
        ? {
            rule: "PUBLIC/private-vulnerability-reporting",
            state: "passed",
            detail: "Private vulnerability reporting enabled.",
          }
        : {
            rule: "PUBLIC/private-vulnerability-reporting",
            state: "failed",
            detail: "Private vulnerability reporting is disabled.",
          }
    );

    results.push(evaluateCommitPrivacy(listHostedCommits(slug, defaultBranch)));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    pushResult("R08/github-state", "failed", detail);
  }
}

const verdict = results.every((result) =>
  result.state === "passed" || result.state === "not-applicable"
) ? "passed" : "failed";

console.log(JSON.stringify({ tool: "release-check", verdict, results }, null, 2));

for (const result of results) {
  if (result.state !== "passed" && result.state !== "not-applicable") {
    console.error(`× ${result.rule} [${result.state}] ${result.detail ?? ""}`);
  }
}

process.exit(verdict === "passed" ? 0 : 1);
