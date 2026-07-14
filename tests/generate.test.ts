import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { formatAppTitle, generateArchetype } from "../scripts/lib/archetype-generator.js";

const repoRoot = process.cwd();
const cleanup: string[] = [];

function makeTempDir(prefix: string) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  cleanup.push(dir);
  return dir;
}

afterEach(async () => {
  while (cleanup.length > 0) {
    const dir = cleanup.pop();
    if (dir) {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

describe("formatAppTitle", () => {
  it("turns a package name into title case words", () => {
    expect(formatAppTitle("fieldnote-mobile")).toBe("Fieldnote Mobile");
  });
});

describe("generateArchetype", () => {
  it("copies the archetype to an external path and replaces personalization tokens", () => {
    const targetRoot = makeTempDir("app-dev-core-generated-");
    const targetDir = join(targetRoot, "fieldnote-mobile");

    const result = generateArchetype({
      archetype: "react-vite-capacitor",
      packageName: "fieldnote-mobile",
      repoRoot,
      targetDir,
    });

    expect(result.appTitle).toBe("Fieldnote Mobile");
    expect(JSON.parse(readFileSync(join(targetDir, "package.json"), "utf8")).name).toBe("fieldnote-mobile");
    expect(readFileSync(join(targetDir, "README.md"), "utf8")).toContain("# Fieldnote Mobile");

    const manifest = JSON.parse(readFileSync(join(targetDir, "app-dev.manifest.json"), "utf8"));
    expect(manifest.product.name).toBe("fieldnote-mobile");
    expect(manifest.baseline.core).toBe(readFileSync(join(repoRoot, "VERSION"), "utf8").trim());

    const config = readFileSync(join(targetDir, ".codex", "config.toml"), "utf8");
    expect(config).toContain('default_permissions = "fieldnote-mobile-workspace"');
    expect(readFileSync(join(targetDir, ".github", "workflows", "verify.yml"), "utf8")).toContain("name: verify");
    expect(readFileSync(join(targetDir, "db", "migrations", ".gitkeep"), "utf8")).toMatch(/\s*/);
    expect(readFileSync(join(targetDir, "src", "platform", "ios", "README.md"), "utf8")).toContain(
      "empty slot"
    );
    expect(readFileSync(join(targetDir, "src", "platform", "android", "README.md"), "utf8")).toContain(
      "empty slot"
    );
    expect(readFileSync(join(targetDir, "README.md"), "utf8")).not.toMatch(/__[a-z0-9_]+__/);
  });

  it("rejects target paths inside the core repository", () => {
    expect(() =>
      generateArchetype({
        archetype: "react-vite-capacitor",
        packageName: "illegal-target",
        repoRoot,
        targetDir: join(repoRoot, ".work", "illegal-target"),
      })
    ).toThrow(/external to the core repository/i);
  });

  it("fails when unresolved tokens remain in the source archetype", () => {
    const sourceDir = makeTempDir("app-dev-core-bad-archetype-");
    const targetRoot = makeTempDir("app-dev-core-bad-generated-");
    const targetDir = join(targetRoot, "bad-generated");

    mkdirSync(join(sourceDir, ".codex"), { recursive: true });
    writeFileSync(join(sourceDir, "package.json"), '{ "name": "__package_name__" }\n');
    writeFileSync(
      join(sourceDir, "app-dev.manifest.json"),
      JSON.stringify(
        {
          product: { name: "__product_name__" },
          baseline: { core: "0.0.0", operatingModel: "0.0.0", archetype: { name: "x", version: "0.0.0" } },
        },
        null,
        2
      )
    );
    writeFileSync(join(sourceDir, ".codex", "config.toml"), 'default_permissions = "__workspace_name__"\n');
    writeFileSync(join(sourceDir, "README.md"), "# __app_title__\n__unknown_token__\n");
    writeFileSync(join(sourceDir, "__unknown_path_token__.md"), "path token file\n");

    expect(() =>
      generateArchetype({
        archetype: "react-vite-capacitor",
        packageName: "bad-generated",
        repoRoot,
        sourceDir,
        targetDir,
      })
    ).toThrow(/Unresolved tokens remain/);
  });

  it("replaces supported tokens in generated path names", () => {
    const sourceDir = makeTempDir("app-dev-core-path-archetype-");
    const targetRoot = makeTempDir("app-dev-core-path-generated-");
    const targetDir = join(targetRoot, "fieldnote-mobile");

    mkdirSync(join(sourceDir, ".codex"), { recursive: true });
    writeFileSync(join(sourceDir, "package.json"), '{ "name": "__package_name__" }\n');
    writeFileSync(
      join(sourceDir, "app-dev.manifest.json"),
      JSON.stringify(
        {
          product: { name: "__product_name__" },
          baseline: { core: "0.0.0", operatingModel: "0.0.0", archetype: { name: "x", version: "0.0.0" } },
        },
        null,
        2
      )
    );
    writeFileSync(join(sourceDir, ".codex", "config.toml"), 'default_permissions = "__workspace_name__"\n');
    writeFileSync(join(sourceDir, "__package_name__.md"), "# generated\n");

    generateArchetype({
      archetype: "react-vite-capacitor",
      packageName: "fieldnote-mobile",
      repoRoot,
      sourceDir,
      targetDir,
    });

    expect(readFileSync(join(targetDir, "fieldnote-mobile.md"), "utf8")).toContain("# generated");
  });
});
