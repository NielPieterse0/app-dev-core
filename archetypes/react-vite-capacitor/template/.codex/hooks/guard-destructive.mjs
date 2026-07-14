#!/usr/bin/env node
import { readFileSync } from "node:fs";

const deny = [
  [/\bgit\s+push\b[^\n]*(--force\b|-f\b|--force-with-lease\b)/, "force push"],
  [/\bgit\s+reset\s+--hard\b/, "hard reset"],
  [/\bgit\s+clean\s+-[a-z]*f[a-z]*d/, "recursive force clean"],
  [/\brm\s+-rf\s+(\/|~|\$HOME)(\s|$)/, "recursive delete of / or ~"],
  [/\bnpm\s+publish\b/, "package publish"],
  [/(^|[\s;|&])(powershell|pwsh|cmd\.exe)([\s;|&]|$)/i, "shell interpreter"],
  [/\.(ps1|sh|bat|cmd)(\s|$)/i, "non-Node script"],
];

let command = "";
try {
  const event = JSON.parse(readFileSync(0, "utf8"));
  command = event?.tool_input?.command ?? event?.command ?? "";
  if (Array.isArray(command)) {
    command = command.join(" ");
  }
} catch {
  process.exit(0);
}

for (const [pattern, label] of deny) {
  if (pattern.test(command)) {
    console.error(`BLOCKED [guard-destructive]: ${label}\n  ${command}`);
    process.exit(2);
  }
}

process.exit(0);
