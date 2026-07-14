import { resolve } from "node:path";
import { generateArchetype } from "./lib/archetype-generator.js";

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const archetype = readArg("--archetype") ?? "react-vite-capacitor";
const target = readArg("--target");
const packageName = readArg("--name") ?? readArg("--package-name");
const title = readArg("--title");

if (!target || !packageName) {
  console.error(
    "Usage: npm run generate -- --target <external-path> --name <package-name> " +
      "[--title <display-title>] [--archetype react-vite-capacitor]"
  );
  process.exit(1);
}

const result = generateArchetype({
  archetype,
  appTitle: title,
  packageName,
  repoRoot: process.cwd(),
  targetDir: resolve(target),
});

console.log(
  JSON.stringify(
    {
      tool: "generate",
      archetype,
      targetDir: result.targetDir,
      packageName: result.packageName,
      appTitle: result.appTitle,
    },
    null,
    2
  )
);
