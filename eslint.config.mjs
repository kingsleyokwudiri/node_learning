import js from "@eslint/js";
import globals from "globals";

/**
 * ESLint 10 flat config.
 *
 * The config file itself is ESM (.mjs) because that is what modern ESLint
 * expects, but every project under this folder is CommonJS, which is why
 * `sourceType` below is "commonjs".
 */
export default [
  // Global ignores. ESLint already skips node_modules, but being explicit
  // documents the intent and keeps `eslint .` fast.
  { ignores: ["**/node_modules/**", "**/package-lock.json"] },

  // ESLint's recommended rules.
  js.configs.recommended,

  // Apply to every JavaScript file in the three sub-projects.
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      // Node globals: require, module, process, __dirname, console, ...
      globals: { ...globals.node },
    },
  },

  // Express only treats 4-argument middleware as an error handler, so the
  // unused `next` parameter in index.js is required by the framework, not
  // dead code.
  {
    files: ["inventory-management-system/index.js"],
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^next$" }],
    },
  },
];
