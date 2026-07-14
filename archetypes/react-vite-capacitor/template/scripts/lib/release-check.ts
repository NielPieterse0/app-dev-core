export type State = "passed" | "failed" | "not-applicable" | "not-run";

export type ReleaseCheckResult = {
  rule: string;
  state: State;
  detail?: string;
};

export type BranchProtectionPayload = {
  allow_force_pushes?: { enabled?: boolean };
  required_pull_request_reviews?: { required_approving_review_count?: number } | null;
  required_status_checks?: {
    strict?: boolean;
    contexts?: string[];
    checks?: Array<{ context?: string }>;
  } | null;
};

export type WorkflowPermissionsPayload = {
  can_approve_pull_request_reviews?: boolean;
  default_workflow_permissions?: string;
};

export type RepoMetadataPayload = {
  private?: boolean;
  security_and_analysis?: {
    dependabot_security_updates?: { status?: string };
    secret_scanning?: { status?: string };
    secret_scanning_push_protection?: { status?: string };
  };
};

export type CheckRunsPayload = {
  total_count?: number;
  check_runs?: Array<{
    name?: string;
    status?: string;
    conclusion?: string | null;
  }>;
};

function fail(rule: string, detail: string): ReleaseCheckResult {
  return { rule, state: "failed", detail };
}

function pass(rule: string, detail: string): ReleaseCheckResult {
  return { rule, state: "passed", detail };
}

function notApplicable(rule: string, detail: string): ReleaseCheckResult {
  return { rule, state: "not-applicable", detail };
}

export function evaluateDependabotConfig(contents: string | null): ReleaseCheckResult {
  if (!contents) {
    return fail("R08/dependabot-config", ".github/dependabot.yml is missing.");
  }

  const hasNpm = /package-ecosystem:\s*"npm"/.test(contents);
  const hasActions = /package-ecosystem:\s*"github-actions"/.test(contents);

  return hasNpm && hasActions
    ? pass("R08/dependabot-config", "Dependabot covers npm and github-actions.")
    : fail(
        "R08/dependabot-config",
        "Dependabot config must cover both npm and github-actions ecosystems."
      );
}

export function evaluateBranchProtection(
  protection: BranchProtectionPayload | null
): ReleaseCheckResult {
  if (!protection) {
    return fail("R08/branch-protection", "Default branch protection is missing.");
  }

  const checks = new Set([
    ...(protection.required_status_checks?.contexts ?? []),
    ...(protection.required_status_checks?.checks ?? []).flatMap((entry) =>
      entry.context ? [entry.context] : []
    ),
  ]);
  const reviewCount = protection.required_pull_request_reviews?.required_approving_review_count ?? 0;
  const missing: string[] = [];

  if (!protection.required_status_checks?.strict) {
    missing.push("strict status checks");
  }

  if (!checks.has("verify")) {
    missing.push('required check "verify"');
  }

  if (reviewCount < 1) {
    missing.push("at least one approving review");
  }

  if (protection.allow_force_pushes?.enabled !== false) {
    missing.push("force-push disabled");
  }

  return missing.length
    ? fail("R08/branch-protection", `Default branch protection missing: ${missing.join(", ")}.`)
    : pass(
        "R08/branch-protection",
        "Default branch requires PR review, strict verify, and no force-push."
      );
}

export function evaluateWorkflowPermissions(
  permissions: WorkflowPermissionsPayload
): ReleaseCheckResult {
  const missing: string[] = [];

  if (permissions.default_workflow_permissions !== "read") {
    missing.push('default workflow permissions "read"');
  }

  if (permissions.can_approve_pull_request_reviews !== false) {
    missing.push("workflows cannot approve pull requests");
  }

  return missing.length
    ? fail("R08/workflow-permissions", `Workflow permission baseline missing: ${missing.join(", ")}.`)
    : pass("R08/workflow-permissions", "Default workflow permissions are read-only.");
}

export function evaluateHostedChecks(checkRuns: CheckRunsPayload): ReleaseCheckResult {
  if ((checkRuns.total_count ?? 0) === 0) {
    return fail("R05/hosted-check-runs", "Hosted check-runs total_count is 0.");
  }

  const verifyRuns = (checkRuns.check_runs ?? []).filter((run) => run.name === "verify");
  if (verifyRuns.length === 0) {
    return fail("R05/hosted-check-runs", "No hosted verify check-run was found for the current HEAD commit.");
  }

  const blockingRun = verifyRuns.find(
    (run) => run.status !== "completed" || run.conclusion !== "success"
  );

  return blockingRun
    ? fail(
        "R05/hosted-check-runs",
        `Hosted verify for the current HEAD is ${blockingRun.status}/${blockingRun.conclusion ?? "pending"}.`
      )
    : pass("R05/hosted-check-runs", "Hosted verify is green for the current HEAD commit.");
}

export function evaluateSecurityAnalysis(repo: RepoMetadataPayload): ReleaseCheckResult[] {
  const security = repo.security_and_analysis ?? {};
  const results: ReleaseCheckResult[] = [
    security.dependabot_security_updates?.status === "enabled"
      ? pass("PUBLIC/dependabot-security-updates", "Dependabot security updates enabled.")
      : fail("PUBLIC/dependabot-security-updates", "Dependabot security updates are disabled."),
  ];

  if (repo.private !== false) {
    results.push(
      notApplicable(
        "R08/secret-scanning",
        "Secret scanning is only required here when GitHub makes it available for the repository."
      )
    );
    return results;
  }

  const missing: string[] = [];
  if (security.secret_scanning?.status !== "enabled") {
    missing.push("secret scanning");
  }
  if (security.secret_scanning_push_protection?.status !== "enabled") {
    missing.push("push protection");
  }

  results.push(
    missing.length
      ? fail("R08/secret-scanning", `GitHub secret-scanning baseline missing: ${missing.join(", ")}.`)
      : pass("R08/secret-scanning", "GitHub secret scanning and push protection enabled.")
  );

  return results;
}
