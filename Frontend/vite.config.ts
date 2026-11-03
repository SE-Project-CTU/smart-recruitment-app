import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^src\/components\/echarts-(.*)$/,
        replacement: `${path.resolve(__dirname, "./src/components/evilcharts/ui/echarts-$1")}`,
      },
      {
        find: /^src\//,
        replacement: `${path.resolve(__dirname, "./src")}/`,
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
});
