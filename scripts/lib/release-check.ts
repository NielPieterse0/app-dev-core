export type State = "passed" | "failed" | "not-applicable" | "not-run";

export type ReleaseCheckResult = {
  rule: string;
  state: State;
  detail?: string;
};

export type BranchProtectionPayload = {
  allow_force_pushes?: { enabled?: boolean };
  required_pull_request_reviews?: { required_approving_review_count?: number } | null;
  required_status_checks?: { strict?: boolean; contexts?: string[] } | null;
};

export type WorkflowPermissionsPayload = {
  can_approve_pull_request_reviews?: boolean;
  default_workflow_permissions?: string;
};

export type SecurityStatus = {
  status?: string;
};

export type SecurityAnalysisPayload = {
  dependabot_security_updates?: SecurityStatus;
  secret_scanning?: SecurityStatus;
  secret_scanning_non_provider_patterns?: SecurityStatus;
  secret_scanning_push_protection?: SecurityStatus;
  secret_scanning_validity_checks?: SecurityStatus;
};

export type RepoMetadataPayload = {
  default_branch?: string;
  private?: boolean;
  security_and_analysis?: SecurityAnalysisPayload;
};

export type HostedCommit = {
  sha: string;
  commit?: {
    author?: { email?: string | null } | null;
    committer?: { email?: string | null } | null;
    message?: string;
  } | null;
};

const ALLOWED_PUBLIC_EMAIL_PATTERNS = [
  /@users\.noreply\.github\.com$/i,
  /^noreply@github\.com$/i,
  /^support@github\.com$/i,
];

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function fail(rule: string, detail: string): ReleaseCheckResult {
  return { rule, state: "failed", detail };
}

function pass(rule: string, detail?: string): ReleaseCheckResult {
  return { rule, state: "passed", detail };
}

function notApplicable(rule: string, detail: string): ReleaseCheckResult {
  return { rule, state: "not-applicable", detail };
}

export function evaluateSecurityPolicyFile(exists: boolean): ReleaseCheckResult {
  return exists
    ? pass("PUBLIC/security-policy", "SECURITY.md present.")
    : fail("PUBLIC/security-policy", "SECURITY.md is missing.");
}

export function evaluateDependabotConfig(contents: string | null): ReleaseCheckResult {
  if (!contents) {
    return fail("R08/dependabot-config", ".github/dependabot.yml is missing.");
  }

  const hasNpm = /package-ecosystem:\s*"npm"/.test(contents);
  const hasActions = /package-ecosystem:\s*"github-actions"/.test(contents);

  if (!hasNpm || !hasActions) {
    return fail(
      "R08/dependabot-config",
      "Dependabot config must cover both npm and github-actions ecosystems."
    );
  }

  return pass("R08/dependabot-config", "Dependabot covers npm and github-actions.");
}

export function evaluateBranchProtection(
  protection: BranchProtectionPayload | null
): ReleaseCheckResult {
  if (!protection) {
    return fail("R08/branch-protection", "Default branch protection is missing.");
  }

  const contexts = new Set(protection.required_status_checks?.contexts ?? []);
  const reviewCount = protection.required_pull_request_reviews?.required_approving_review_count ?? 0;
  const missing: string[] = [];

  if (!protection.required_status_checks?.strict) {
    missing.push("strict status checks");
  }

  if (!contexts.has("verify")) {
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
    : pass("R08/branch-protection", "Default branch requires PR review, strict verify, and no force-push.");
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

export function evaluateHostedChecks(totalCount: number): ReleaseCheckResult {
  return totalCount > 0
    ? pass("R05/hosted-check-runs", `${totalCount} hosted check-run(s) observed on the default branch.`)
    : fail("R05/hosted-check-runs", "Hosted check-runs total_count is 0.");
}

export function evaluateSecurityAnalysis(
  repo: RepoMetadataPayload
): ReleaseCheckResult[] {
  const security = repo.security_and_analysis ?? {};
  const isPublic = repo.private === false;

  const results: ReleaseCheckResult[] = [
    security.dependabot_security_updates?.status === "enabled"
      ? pass("PUBLIC/dependabot-security-updates", "Dependabot security updates enabled.")
      : fail("PUBLIC/dependabot-security-updates", "Dependabot security updates are disabled."),
  ];

  if (!isPublic) {
    results.push(
      notApplicable(
        "R08/secret-scanning",
        "Secret-scanning posture is only required here when GitHub makes it available for the repository."
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

export function isAllowedPublicEmail(email: string): boolean {
  return ALLOWED_PUBLIC_EMAIL_PATTERNS.some((pattern) => pattern.test(email.trim()));
}

export function extractEmails(value: string): string[] {
  return value.match(EMAIL_PATTERN) ?? [];
}

export function evaluateCommitPrivacy(commits: HostedCommit[]): ReleaseCheckResult {
  const disallowed = new Set<string>();

  for (const item of commits) {
    const authorEmail = item.commit?.author?.email;
    const committerEmail = item.commit?.committer?.email;

    for (const email of [authorEmail, committerEmail]) {
      if (email && !isAllowedPublicEmail(email)) {
        disallowed.add(email);
      }
    }

    for (const email of extractEmails(item.commit?.message ?? "")) {
      if (!isAllowedPublicEmail(email)) {
        disallowed.add(email);
      }
    }
  }

  return disallowed.size
    ? fail(
        "PUBLIC/commit-email-privacy",
        `Disallowed public email(s) found in hosted commit history: ${[...disallowed].sort().join(", ")}.`
      )
    : pass("PUBLIC/commit-email-privacy", "Hosted commit history uses noreply or service-safe email addresses only.");
}
