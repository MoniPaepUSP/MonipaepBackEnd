import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import styleTs from "@stylistic/eslint-plugin-ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "@stylistic/ts": styleTs,
    },

    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ["src/**/*.ts"],
    // ignores: ["./*", "src/__tests__/*"],
    rules: {
      "no-console": "warn",
      "@stylistic/ts/object-curly-spacing": ["error", "always"],
      "@stylistic/ts/func-call-spacing": ["error", "always"],
      "@stylistic/ts/function-call-spacing": ["error", "always"],
      "@stylistic/ts/indent": ["error", 2],
      "@stylistic/ts/quotes": ["error", "single"],
      "@stylistic/ts/space-before-blocks": ["error", "always"],
    },
  },
];
