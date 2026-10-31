import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      "unused-imports": unusedImports,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Tắt các luật mặc định để không bị đụng độ
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // tự động dọn dẹp các IMPORT thừa
      "unused-imports/no-unused-imports": "error",
      // Báo gạch vàng cho BIẾN thừa, tuyệt đối không tự xóa code ehehehe
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
