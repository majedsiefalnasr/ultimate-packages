import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// G3E-1: the shared fixtures are served at /media/<file>, as in the Ultimate Storybooks.
export default defineConfig({ plugins: [vue()], publicDir: "../fixtures" });
