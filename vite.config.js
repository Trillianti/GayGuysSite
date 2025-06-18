import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "gayguys.trillianti.trl", // Указываем домен, который используешь
    port: 50000,
    https: {
      key: fs.readFileSync("C:/nginx/certs/trillianti.key"),
      cert: fs.readFileSync("C:/nginx/certs/trillianti.crt"),
    },
    hmr: {
      protocol: "wss", // WebSocket через SSL
      host: "gayguys.trillianti.trl",
      port: 50000,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});
