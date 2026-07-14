/** The directory grammar. Single owner of "where does this go". */
export const TOP_LEVEL = new Set([
  "AGENTS.md", "README.md", "SECURITY.md", "VERSION", "LICENSE", "VERIFY-BEFORE-USE.md",
  "package.json", "package-lock.json", ".nvmrc", ".gitignore", ".gitattributes",
  "tsconfig.json", "eslint.config.js", "app-dev.manifest.json",
  ".codex", ".agents", ".github", ".write", "docs", "standards", "governance",
  "archetypes", "capabilities", "core", "schemas", "scripts", "tests",
  ".git", "node_modules",
]);

/** Artifact types with no slot. Compiled into the write-time hook. */
export const NO_SLOT_PATTERNS: RegExp[] = [
  /(^|\/)tasks\.md$/i,
  /(^|\/)workflow-receipts?\.md$/i,
  /(^|\/)checklist\.md$/i,
  /(^|\/)convergence\.md$/i,
  /(^|\/)(plans|audit|closeout|worker-reports)\//i,
  /(^|\/)\.superpowers\//i,
  /(^|\/)projects\//i,
];

/** Commands that are never run. Compiled into the write-time hook. */
export const DESTRUCTIVE: [RegExp, string][] = [
  [/\bgit\s+push\b[^\n]*(--force\b|-f\b|--force-with-lease\b)/, "force push"],
  [/\bgit\s+reset\s+--hard\b/, "hard reset"],
  [/\bgit\s+clean\s+-[a-z]*f[a-z]*d/, "recursive force clean"],
  [/\bgit\s+filter-repo\b/, "history rewrite"],
  [/\brm\s+-rf\s+(\/|~|\$HOME)(\s|$)/, "recursive delete of / or ~"],
  [/\bnpm\s+publish\b/, "package publish"],
  [/supabase\s+db\s+(reset|push)[^\n]*--linked/, "destructive op against a LINKED project"],
  [/(^|[\s;|&])(powershell|pwsh|cmd\.exe)([\s;|&]|$)/i, "shell interpreter [R10]"],
  [/\.(ps1|sh|bat|cmd)(\s|$)/i, "non-Node script [R10]"],
];
