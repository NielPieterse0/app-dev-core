import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

type Finding = {
  file: string;
  label: string;
};

const skipDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  ".work",
]);

const blockedFiles = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
]);

const secretPatterns: { label: string; pattern: RegExp }[] = [
  { label: "OpenAI API key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { label: "GitHub token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { label: "Supabase secret key", pattern: /\bsb_secret_[A-Za-z0-9]{20,}\b/ },
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { label: "Stripe secret key", pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/ },
  { label: "Slack token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/ },
  { label: "Private key block", pattern: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/ },
];

function trackedFiles() {
  const tracked = spawnSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (tracked.status === 0) {
    return tracked.stdout
      .split("\0")
      .map((file) => file.trim())
      .filter(Boolean);
  }

  const root = process.cwd();
  const files: string[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (skipDirectories.has(entry.name)) {
        continue;
      }

      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      files.push(relative(root, fullPath).replace(/\\/g, "/"));
    }
  }

  walk(root);
  return files;
}

function isTextFile(filePath: string) {
  return /\.(ts|tsx|js|mjs|json|toml|ya?ml|md|css|html|txt|gitignore|gitattributes|env)$/i.test(filePath);
}

const findings: Finding[] = [];

for (const filePath of trackedFiles()) {
  const basename = filePath.split("/").pop() ?? filePath;

  if (blockedFiles.has(basename)) {
    findings.push({ file: filePath, label: "Tracked environment file" });
    continue;
  }

  if (!isTextFile(filePath)) {
    continue;
  }

  let content = "";

  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    continue;
  }

  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(content)) {
      findings.push({ file: filePath, label });
    }
  }
}

const verdict = findings.length === 0 ? "passed" : "failed";

console.log(
  JSON.stringify(
    {
      tool: "scan-secrets",
      verdict,
      findings,
    },
    null,
    2
  )
);

for (const finding of findings) {
  console.error(`✗ ${finding.label}: ${finding.file}`);
}

process.exit(verdict === "passed" ? 0 : 1);
