import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["src/**/*.ts"],
    ignores: ["./*", "src/__tests__/*"],
  },
];
