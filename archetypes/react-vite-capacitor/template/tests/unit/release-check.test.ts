import { describe, expect, it } from "vitest";
import {
  evaluateBranchProtection,
  evaluateDependabotConfig,
  evaluateDeviationExpiries,
  evaluateHostedChecks,
  evaluateSecurityAnalysis,
  evaluateWorkflowPermissions,
} from "@scripts/lib/release-check.js";

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
  it("fails when force-push remains enabled", () => {
    expect(
      evaluateBranchProtection({
        allow_force_pushes: { enabled: true },
        required_pull_request_reviews: { required_approving_review_count: 1 },
        required_status_checks: { strict: true, contexts: ["verify"] },
      })
    ).toMatchObject({
      rule: "R08/branch-protection",
      state: "failed",
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

describe("evaluateHostedChecks", () => {
  it("uses R05 for missing hosted verify dispatch", () => {
    expect(evaluateHostedChecks({ total_count: 0, check_runs: [] })).toMatchObject({
      rule: "R05/hosted-check-runs",
      state: "failed",
    });
  });
});

describe("evaluateSecurityAnalysis", () => {
  it("fails when a public repository lacks secret scanning", () => {
    const results = evaluateSecurityAnalysis({
      private: false,
      security_and_analysis: {
        dependabot_security_updates: { status: "enabled" },
        secret_scanning: { status: "disabled" },
        secret_scanning_push_protection: { status: "disabled" },
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

describe("evaluateDeviationExpiries", () => {
  it("fails when a deviation has expired", () => {
    expect(
      evaluateDeviationExpiries(
        {
          deviations: [
            {
              rule: "OM-11.5-PUBLIC-DISTRIBUTION",
              expires: "2026-01-01",
            },
          ],
        },
        new Date("2026-07-14T00:00:00Z")
      )
    ).toMatchObject({
      rule: "R26/deviation-expiry",
      state: "failed",
    });
  });
});
