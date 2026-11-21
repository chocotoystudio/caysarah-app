import { defineConfig } from "vite";
import path from "path";
export default defineConfig({ root: path.resolve(__dirname, ".."), resolve: { alias: [{ find: /^\.\/supabase\.js$/, replacement: path.resolve(__dirname, "mock-supabase.js") }, { find: "virtual:pwa-register", replacement: path.resolve(__dirname, "pwa-stub.js") }] }, server: { port: 5199 } });
