import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";

const TEXT_FILE = /\.(md|json|toml|ya?ml|ts|tsx|js|mjs|css|html|txt|gitignore|gitattributes)$/i;
const SKIP = new Set([
  "node_modules",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  ".work",
  ".local",
]);
const TOKEN = /__[a-z0-9_]+__/g;
const SOURCE_SEGMENT_MAP: Record<string, string> = {
  ".github-template": ".github",
  "_ledger": "migrations",
};

export type GenerateArchetypeOptions = {
  archetype: string;
  appTitle?: string;
  packageName: string;
  productName?: string;
  repoRoot: string;
  sourceDir?: string;
  targetDir: string;
};

export function formatAppTitle(packageName: string) {
  return packageName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function createTempDir(prefix: string) {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function validateExternalTarget(repoRoot: string, targetDir: string) {
  const root = resolve(repoRoot);
  const target = resolve(targetDir);
  const rel = relative(root, target).replace(/\\/g, "/");
  if (rel === "" || (!rel.startsWith("..") && rel !== ".")) {
    throw new Error(`Target path must be external to the core repository: ${target}`);
  }
}

function validatePackageName(packageName: string) {
  if (!/^[a-z0-9._-]+$/.test(packageName)) {
    throw new Error(
      `Package name "${packageName}" is invalid. Use lowercase letters, digits, dots, underscores, or hyphens.`
    );
  }
}

function listFiles(root: string, current = root, files: string[] = []) {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) {
      continue;
    }

    const fullPath = join(current, entry.name);

    if (entry.isDirectory()) {
      listFiles(root, fullPath, files);
      continue;
    }

    files.push(relative(root, fullPath).replace(/\\/g, "/"));
  }

  return files;
}

function listEntries(root: string, current = root, entries: string[] = []) {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) {
      continue;
    }

    const fullPath = join(current, entry.name);
    const relativePath = relative(root, fullPath).replace(/\\/g, "/");

    entries.push(relativePath);

    if (entry.isDirectory()) {
      listEntries(root, fullPath, entries);
    }
  }

  return entries;
}

function replaceKnownTokens(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (content, [token, replacement]) => content.split(token).join(replacement),
    value
  );
}

function copyTree(sourceDir: string, targetDir: string, replacements: Record<string, string>) {
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) {
      continue;
    }

    const sourcePath = join(sourceDir, entry.name);
    const sourceName = SOURCE_SEGMENT_MAP[entry.name] ?? entry.name;
    const targetPath = join(targetDir, replaceKnownTokens(sourceName, replacements));

    if (entry.isDirectory()) {
      mkdirSync(targetPath, { recursive: true });
      copyTree(sourcePath, targetPath, replacements);
      continue;
    }

    writeFileSync(targetPath, readFileSync(sourcePath));
  }
}

function replaceTokens(targetDir: string, replacements: Record<string, string>) {
  for (const relativePath of listFiles(targetDir)) {
    if (!TEXT_FILE.test(relativePath)) {
      continue;
    }

    const absolutePath = join(targetDir, relativePath);
    const source = readFileSync(absolutePath, "utf8");
    const replaced = Object.entries(replacements).reduce(
      (content, [token, value]) => content.split(token).join(value),
      source
    );

    writeFileSync(absolutePath, replaced);
  }
}

function findUnresolvedTokens(targetDir: string) {
  const unresolved: string[] = [];

  for (const relativePath of listEntries(targetDir)) {
    const pathMatches = relativePath.match(TOKEN);

    if (pathMatches) {
      unresolved.push(`${relativePath}: path contains ${pathMatches.join(", ")}`);
    }

    const absolutePath = join(targetDir, relativePath);
    if (statSync(absolutePath).isDirectory() || !TEXT_FILE.test(relativePath)) {
      continue;
    }

    const content = readFileSync(absolutePath, "utf8");
    const matches = content.match(TOKEN);

    if (matches) {
      unresolved.push(`${relativePath}: ${matches.join(", ")}`);
    }
  }

  return unresolved;
}

function readOperatingModelVersion(repoRoot: string) {
  const om = readFileSync(join(repoRoot, "docs", "operating-model", "operating-model.md"), "utf8");
  const version = om.match(/\|\s+\*\*Version\*\*\s+\|\s+([^|]+)\|/)?.[1]?.trim();

  if (!version) {
    throw new Error("Unable to determine the operating model version from docs/operating-model/operating-model.md");
  }

  return version;
}

function readCoreVersion(repoRoot: string) {
  const version = readFileSync(join(repoRoot, "VERSION"), "utf8").trim();
  if (!version) {
    throw new Error("VERSION is empty.");
  }
  return version;
}

function syncManifest(targetDir: string, repoRoot: string, archetype: string, productName: string) {
  const manifestPath = join(targetDir, "app-dev.manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    product: { name: string };
    baseline: { core: string; operatingModel: string; archetype: { name: string; version: string } };
  };

  manifest.product.name = productName;
  manifest.baseline.core = readCoreVersion(repoRoot);
  manifest.baseline.operatingModel = readOperatingModelVersion(repoRoot);
  manifest.baseline.archetype.name = archetype;
  manifest.baseline.archetype.version = readCoreVersion(repoRoot);

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

export function generateArchetype(options: GenerateArchetypeOptions) {
  const repoRoot = resolve(options.repoRoot);
  const sourceDir = resolve(options.sourceDir ?? join(repoRoot, "archetypes", options.archetype, "template"));
  const targetDir = resolve(options.targetDir);
  const packageName = options.packageName.trim();
  const productName = (options.productName ?? packageName).trim();
  const appTitle = (options.appTitle ?? formatAppTitle(packageName)).trim();
  const workspaceName = `${packageName}-workspace`;

  validatePackageName(packageName);
  validateExternalTarget(repoRoot, targetDir);

  if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`Archetype source directory does not exist: ${sourceDir}`);
  }

  if (statSync(targetDir, { throwIfNoEntry: false })) {
    throw new Error(`Target path already exists: ${targetDir}`);
  }

  mkdirSync(dirname(targetDir), { recursive: true });
  mkdirSync(targetDir, { recursive: true });

  try {
    const replacements = {
      "__app_title__": appTitle,
      "__package_name__": packageName,
      "__product_name__": productName,
      "__workspace_name__": workspaceName,
    };
    copyTree(sourceDir, targetDir, replacements);
    replaceTokens(targetDir, replacements);
    syncManifest(targetDir, repoRoot, options.archetype, productName);

    const unresolved = findUnresolvedTokens(targetDir);
    if (unresolved.length) {
      throw new Error(`Unresolved tokens remain after generation:\n${unresolved.join("\n")}`);
    }
  } catch (error) {
    rmSync(targetDir, { recursive: true, force: true });
    throw error;
  }

  return {
    appTitle,
    packageName,
    productName,
    targetDir,
    workspaceName,
  };
}
