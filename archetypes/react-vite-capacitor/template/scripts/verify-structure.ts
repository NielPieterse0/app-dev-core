import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

type State = "passed" | "failed" | "missing";
type Result = { rule: string; state: State; detail?: string };

const root = process.cwd();
const skip = new Set([".git", "node_modules", "dist", "coverage", "playwright-report", "test-results", ".write", ".work"]);

const topLevelEntries = new Set([
  ".agents",
  ".codex",
  ".env.example",
  ".gitattributes",
  ".github",
  ".gitignore",
  ".nvmrc",
  "AGENTS.md",
  "README.md",
  "VERIFY-BEFORE-USE.md",
  "app-dev.manifest.json",
  "db",
  "docs",
  "eslint.config.js",
  "index.html",
  "package-lock.json",
  "package.json",
  "playwright.config.ts",
  "scripts",
  "specs",
  "src",
  "tests",
  "tsconfig.json",
  "vite.config.ts",
  "vitest.config.ts",
]);

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  ".nvmrc",
  ".env.example",
  "app-dev.manifest.json",
  "package.json",
  ".github/workflows/verify.yml",
  ".github/pull_request_template.md",
  ".agents/skills/product-workflow/SKILL.md",
  "scripts/scan-secrets.ts",
  "scripts/verify.ts",
  "scripts/release-check.ts",
  "scripts/verify-structure.ts",
  "src/data/adapters/index.ts",
  "src/main.tsx",
  "src/platform/android/README.md",
  "src/platform/ios/README.md",
  "specs/000-product-foundation/spec.md",
  "docs/product.md",
  "docs/operating-model-reference.md",
];

function walk(directory: string, files: string[] = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(entry.name)) {
      continue;
    }

    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    files.push(relative(root, fullPath).replace(/\\/g, "/"));
  }

  return files;
}

const read = (filePath: string) => {
  try {
    return readFileSync(join(root, filePath), "utf8");
  } catch {
    return "";
  }
};

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const files = walk(root);
const results: Result[] = [];

for (const requiredPath of requiredPaths) {
  if (!existsSync(join(root, requiredPath))) {
    results.push({ rule: "required-paths", state: "missing", detail: requiredPath });
  }
}

const actualTopLevels = readdirSync(root).filter(
  (entry) => !skip.has(entry) && entry !== ".git" && entry !== "node_modules"
);
const unexpectedTopLevels = actualTopLevels.filter((entry) => !topLevelEntries.has(entry));

results.push(
  unexpectedTopLevels.length
    ? {
        rule: "R24",
        state: "failed",
        detail: `No slot in the grammar: ${unexpectedTopLevels.join(", ")}`,
      }
    : { rule: "R24", state: "passed" }
);

const noSlotPatterns = [
  /(^|\/)tasks\.md$/i,
  /(^|\/)workflow-receipts?\.md$/i,
  /(^|\/)checklist\.md$/i,
  /(^|\/)convergence\.md$/i,
  /(^|\/)(plans|audit|closeout|worker-reports)\//i,
  /(^|\/)\.superpowers\//i,
];
const noSlotHits = files.filter((filePath) => noSlotPatterns.some((pattern) => pattern.test(filePath)));
results.push(
  noSlotHits.length
    ? { rule: "R18", state: "failed", detail: noSlotHits.join(", ") }
    : { rule: "R18", state: "passed" }
);

const shellFiles = files.filter((filePath) => /\.(ps1|psm1|psd1|sh|bat|cmd)$/i.test(filePath));
results.push(
  shellFiles.length
    ? { rule: "R10", state: "failed", detail: shellFiles.join(", ") }
    : { rule: "R10", state: "passed" }
);

const packageJson = JSON.parse(read("package.json") || "{}");
const scriptNames = Object.keys(packageJson.scripts ?? {}).sort();
const expectedScripts = ["release:check", "verify"];

results.push(
  JSON.stringify(scriptNames) !== JSON.stringify(expectedScripts)
    ? {
        rule: "R21",
        state: "failed",
        detail: `package.json scripts must be exactly ${expectedScripts.join(", ")}`,
      }
    : { rule: "R21", state: "passed" }
);

results.push(
  packageJson.engines?.node !== "22.x"
    ? { rule: "R11-node", state: "failed", detail: "package.json engines.node should be 22.x" }
    : { rule: "R11-node", state: "passed" }
);

results.push(
  packageJson.engines?.npm !== "10.x"
    ? { rule: "R11-npm", state: "failed", detail: "package.json engines.npm should be 10.x" }
    : { rule: "R11-npm", state: "passed" }
);

results.push(
  packageJson.packageManager !== "npm@10.9.0"
    ? {
        rule: "R11-packageManager",
        state: "failed",
        detail: "package.json packageManager should be npm@10.9.0",
      }
    : { rule: "R11-packageManager", state: "passed" }
);

results.push(
  read(".nvmrc").trim() !== "22"
    ? { rule: "R11-.nvmrc", state: "failed", detail: ".nvmrc should pin Node major 22" }
    : { rule: "R11-.nvmrc", state: "passed" }
);

const absolutePathPattern = /(^|["'\s=(])([A-Za-z]:\\|\/(Users|home|mnt|opt|root|tmp|var)\/)/;
const absolutePathHits = files
  .filter((filePath) => /\.(ts|tsx|js|mjs|json|toml|ya?ml|md)$/i.test(filePath))
  .filter((filePath) => !filePath.startsWith("tests/"))
  .filter((filePath) => absolutePathPattern.test(stripComments(read(filePath))));

results.push(
  absolutePathHits.length
    ? { rule: "R12", state: "failed", detail: absolutePathHits.join(", ") }
    : { rule: "R12", state: "passed" }
);

const browserGlobalPattern = /\b(window|document|localStorage|sessionStorage|navigator)\b/;
const browserGlobalHits = files
  .filter((filePath) => /^src\//.test(filePath) && /\.(ts|tsx)$/.test(filePath))
  .filter((filePath) => !filePath.startsWith("src/platform/") && filePath !== "src/main.tsx")
  .filter((filePath) => browserGlobalPattern.test(stripComments(read(filePath))));

results.push(
  browserGlobalHits.length
    ? { rule: "R33", state: "failed", detail: browserGlobalHits.join(", ") }
    : { rule: "R33", state: "passed" }
);

const html = read("index.html");
const appShellCss = read("src/ui/shell/app-shell.css");
const r35Missing: string[] = [];

if (!/viewport-fit=cover/.test(html)) {
  r35Missing.push("index.html missing viewport-fit=cover");
}

if (!/min-height:\s*100dvh\s*;/.test(appShellCss)) {
  r35Missing.push("src/ui/shell/app-shell.css missing 100dvh app shell height");
}

if (!/env\(safe-area-inset-(top|left|right|bottom)\)/.test(appShellCss)) {
  r35Missing.push("src/ui/shell/app-shell.css missing safe-area inset usage");
}

if (!/min-height:\s*44px\s*;/.test(appShellCss)) {
  r35Missing.push("src/ui/shell/app-shell.css missing 44px touch target minimum");
}

results.push(
  r35Missing.length
    ? { rule: "R35", state: "failed", detail: r35Missing.join("; ") }
    : { rule: "R35", state: "passed" }
);

const repoEscapeHits: string[] = [];

for (const filePath of files.filter(
  (candidate) => /\.(ts|tsx|js|mjs)$/.test(candidate) && !candidate.startsWith("tests/")
)) {
  const imports = [...stripComments(read(filePath)).matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1]!
  );

  for (const imported of imports) {
    if (!imported.startsWith(".")) {
      continue;
    }

    const resolved = resolve(dirname(join(root, filePath)), imported);
    const rel = relative(root, resolved);
    if (rel.startsWith("..")) {
      repoEscapeHits.push(`${filePath} -> ${imported}`);
    }
  }
}

results.push(
  repoEscapeHits.length
    ? { rule: "R02", state: "failed", detail: repoEscapeHits.join("; ") }
    : { rule: "R02", state: "passed" }
);

const verdict = results.every((result) => result.state === "passed") ? "passed" : "failed";

console.log(JSON.stringify({ tool: "verify-structure", verdict, results }, null, 2));

for (const result of results) {
  if (result.state !== "passed") {
    console.error(`✗ ${result.rule} [${result.state}] ${result.detail ?? ""}`);
  }
}

process.exit(verdict === "passed" ? 0 : 1);
