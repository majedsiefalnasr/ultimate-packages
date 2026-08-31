import { defineConfig } from "tsup";
import vuePlugin from "@vitejs/plugin-vue";
import { createFilter } from "vite";

const vue = vuePlugin();
const filter = createFilter(/\.vue$/);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "ripple/index": "src/ripple/index.ts",
    "button/index": "src/button/index.ts",
    "checkbox/index": "src/checkbox/index.ts",
    "dialog/index": "src/dialog/index.ts",
    "menu/index": "src/menu/index.ts",
    "tooltip/index": "src/tooltip/index.ts",
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
  esbuildPlugins: [
    {
      name: "vue-sfc",
      setup(build) {
        build.onLoad({ filter: /\.vue$/ }, async (args) => {
          const fs = await import("node:fs/promises");
          const source = await fs.readFile(args.path, "utf8");
          if (!filter(args.path)) return undefined;
          const result = await vue.transform.call({ addWatchFile() {} }, source, args.path);
          const code = typeof result === "string" ? result : result?.code ?? source;
          return { contents: code, loader: "ts" };
        });
      },
    },
  ],
});
