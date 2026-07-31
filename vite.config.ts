import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"], // gives you the @ path alias, driven by tsconfig.json's "paths"
    }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "./src/server.ts" }, // your existing SSR error wrapper
    }),
    nitro(), // Vercel auto-detects this — no explicit preset needed
    viteReact(),
  ],
});
