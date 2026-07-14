#!/usr/bin/env node
import { readFileSync } from "node:fs";

const noSlot = [
  /(^|\/)tasks\.md$/i,
  /(^|\/)workflow-receipts?\.md$/i,
  /(^|\/)checklist\.md$/i,
  /(^|\/)convergence\.md$/i,
  /(^|\/)(plans|audit|closeout|worker-reports)\//i,
  /(^|\/)\.superpowers\//i,
];

const shell = /\.(ps1|psm1|psd1|sh|bat|cmd)$/i;
const topLevel = new Set([
  ".agents",
  ".codex",
  ".env.example",
  ".gitattributes",
  ".github",
  ".git",
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
  "node_modules",
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

function block(message) {
  console.error(`BLOCKED [guard-grammar]\n  ${message}`);
  process.exit(2);
}

let filePath = "";
try {
  const event = JSON.parse(readFileSync(0, "utf8"));
  filePath = event?.tool_input?.path ?? event?.tool_input?.file_path ?? event?.path ?? "";
} catch {
  process.exit(0);
}

if (!filePath) {
  process.exit(0);
}

const relativePath = filePath.replace(/\\/g, "/").replace(/^\.\//, "");
const segments = relativePath.split("/");

if (noSlot.some((pattern) => pattern.test(relativePath))) {
  block(`"${relativePath}" has no slot in the product grammar.`);
}

if (shell.test(relativePath)) {
  block(`"${relativePath}" is a shell script. Keep tooling in TypeScript.`);
}

if (!topLevel.has(segments[0])) {
  block(`"${segments[0]}" is not a legal top-level entry.`);
}

process.exit(0);
