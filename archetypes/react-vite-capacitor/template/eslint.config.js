import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const restrictedImportRule = (patterns) => ["error", { patterns }];

const capacitorRestriction = {
  paths: [
    {
      name: "@capacitor/core",
      message:
        "Capacitor belongs in src/platform/**. Keep domain, data, features, and ui platform-free.",
    },
  ],
  patterns: [
    {
      group: ["@capacitor/*"],
      message:
        "Capacitor plugins belong in src/platform/**. Keep domain, data, features, and ui platform-free.",
    },
  ],
};

const browserGlobalsRestriction = [
  "error",
  {
    name: "window",
    message: "Browser globals belong in src/platform/**.",
  },
  {
    name: "document",
    message: "Browser globals belong in src/platform/**.",
  },
  {
    name: "navigator",
    message: "Browser globals belong in src/platform/**.",
  },
  {
    name: "localStorage",
    message: "Browser storage belongs behind the KeyValueStore port in src/platform/**.",
  },
  {
    name: "sessionStorage",
    message: "Browser storage belongs behind the KeyValueStore port in src/platform/**.",
  },
];

const globalThisBrowserRestrictions = [
  "error",
  {
    object: "globalThis",
    property: "window",
    message: "Browser globals belong in src/platform/**.",
  },
  {
    object: "globalThis",
    property: "document",
    message: "Browser globals belong in src/platform/**.",
  },
  {
    object: "globalThis",
    property: "navigator",
    message: "Browser globals belong in src/platform/**.",
  },
  {
    object: "globalThis",
    property: "localStorage",
    message: "Browser storage belongs behind the KeyValueStore port in src/platform/**.",
  },
  {
    object: "globalThis",
    property: "sessionStorage",
    message: "Browser storage belongs behind the KeyValueStore port in src/platform/**.",
  },
];

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "android/**", "ios/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {},
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "no-restricted-imports": ["error", capacitorRestriction],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/platform/**/*.{ts,tsx}", "src/main.tsx"],
    rules: {
      "no-restricted-globals": browserGlobalsRestriction,
      "no-restricted-properties": globalThisBrowserRestrictions,
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImportRule([
        {
          group: ["**/data/**", "**/features/**", "**/ui/**", "**/platform/**"],
          message: "domain stays pure. Keep dependencies flowing inward only.",
        },
      ]),
    },
  },
  {
    files: ["src/data/ports/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImportRule([
        {
          group: ["**/data/adapters/**", "**/features/**", "**/ui/**", "**/platform/**"],
          message: "data/ports define contracts only. They must not reach outward.",
        },
      ]),
    },
  },
  {
    files: ["src/data/adapters/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImportRule([
        {
          group: ["**/features/**", "**/ui/**", "**/platform/**"],
          message: "Concrete adapters belong below features and ui, never above them.",
        },
      ]),
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImportRule([
        {
          group: ["**/data/adapters/**", "**/ui/**", "**/platform/**"],
          message: "features may depend on domain and ports only.",
        },
      ]),
    },
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImportRule([
        {
          group: ["**/data/**", "**/platform/**"],
          message: "ui stays platform-free and consumes features or domain types only.",
        },
      ]),
    },
  },
  {
    files: ["src/platform/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        history: "readonly",
        location: "readonly",
        URL: "readonly",
        Blob: "readonly",
        PopStateEvent: "readonly",
      },
    },
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["src/platform/web/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImportRule([
        {
          group: [
            "**/platform/native/**",
            "**/platform/ios/**",
            "**/platform/android/**",
            "**/platform/desktop/**",
            "@/platform/native/**",
            "@/platform/ios/**",
            "@/platform/android/**",
            "@/platform/desktop/**",
          ],
          message: "Platform implementations bind only at src/platform/composition.ts.",
        },
      ]),
    },
  },
  {
    files: ["src/main.tsx", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        history: "readonly",
        location: "readonly",
        URL: "readonly",
        Blob: "readonly",
        HTMLAnchorElement: "readonly",
        PopStateEvent: "readonly",
      },
    },
  },
  {
    files: ["scripts/**/*.ts", ".codex/hooks/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  }
);
