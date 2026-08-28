import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.gitkeep", ".vendor-extracted/**"],
  },
  {
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
      },
    },
  },
  {
    // Prime-derived source retained verbatim from the pinned MIT baselines
    // (see docs/architecture/PROVENANCE.md). These rules govern originally-
    // authored Ultimate code; rewriting upstream utility signatures to
    // satisfy them would mean reformatting vendored code beyond what
    // adaptation requires (Phase 1 plan, Task 10 Step 4).
    files: ["packages/uix-*/src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-useless-escape": "off",
      "no-prototype-builtins": "off",
      "no-unsafe-optional-chaining": "off",
      "no-empty": "off",
    },
  }
);
