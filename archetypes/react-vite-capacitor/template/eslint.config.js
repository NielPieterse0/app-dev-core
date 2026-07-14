import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

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
