import { describe, expect, it } from "vitest";
import {
  evaluateBranchProtection,
  evaluateCommitPrivacy,
  evaluateDependabotConfig,
  evaluateSecurityAnalysis,
  evaluateSecurityPolicyFile,
  evaluateWorkflowPermissions,
  extractEmails,
  isAllowedPublicEmail,
} from "../scripts/lib/release-check.js";

describe("evaluateSecurityPolicyFile", () => {
  it("fails when SECURITY.md is missing", () => {
    expect(evaluateSecurityPolicyFile(false)).toMatchObject({
      rule: "PUBLIC/security-policy",
      state: "failed",
    });
  });
});

describe("evaluateDependabotConfig", () => {
  it("requires both npm and github-actions ecosystems", () => {
    expect(
      evaluateDependabotConfig('version: 2\nupdates:\n  - package-ecosystem: "npm"\n')
    ).toMatchObject({
      rule: "R08/dependabot-config",
      state: "failed",
    });
  });
});

describe("evaluateBranchProtection", () => {
  it("passes for the intended baseline", () => {
    expect(
      evaluateBranchProtection({
        allow_force_pushes: { enabled: false },
        required_pull_request_reviews: { required_approving_review_count: 1 },
        required_status_checks: { strict: true, contexts: ["verify"] },
      })
    ).toMatchObject({
      rule: "R08/branch-protection",
      state: "passed",
    });
  });
});

describe("evaluateWorkflowPermissions", () => {
  it("fails when workflow permissions exceed read-only", () => {
    expect(
      evaluateWorkflowPermissions({
        default_workflow_permissions: "write",
        can_approve_pull_request_reviews: true,
      })
    ).toMatchObject({
      rule: "R08/workflow-permissions",
      state: "failed",
    });
  });
});

describe("evaluateSecurityAnalysis", () => {
  it("fails when public-repo secret scanning is disabled", () => {
    const results = evaluateSecurityAnalysis({
      private: false,
      security_and_analysis: {
        dependabot_security_updates: { status: "enabled" },
        secret_scanning: { status: "disabled" },
        secret_scanning_non_provider_patterns: { status: "disabled" },
        secret_scanning_push_protection: { status: "disabled" },
        secret_scanning_validity_checks: { status: "disabled" },
      },
    });

    expect(results).toContainEqual(
      expect.objectContaining({
        rule: "R08/secret-scanning",
        state: "failed",
      })
    );
  });
});

describe("public email checks", () => {
  it("accepts GitHub noreply addresses", () => {
    expect(isAllowedPublicEmail("222640156+NielPieterse0@users.noreply.github.com")).toBe(true);
    expect(isAllowedPublicEmail("noreply@github.com")).toBe(true);
    expect(isAllowedPublicEmail("support@github.com")).toBe(true);
  });

  it("extracts email addresses from commit trailers", () => {
    expect(
      extractEmails("Co-authored-by: Example Person <person@example.com>")
    ).toEqual(["person@example.com"]);
  });

  it("fails when hosted commits expose a personal email", () => {
    expect(
      evaluateCommitPrivacy([
        {
          sha: "abc123",
          commit: {
            author: { email: "person@gmail.com" },
            committer: { email: "noreply@github.com" },
            message: "fix: example",
          },
        },
      ])
    ).toMatchObject({
      rule: "PUBLIC/commit-email-privacy",
      state: "failed",
    });
  });
});
