import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://e-learning-platform-3.runasp.net/",
        changeOrigin: true,
      },
      "/Images": {
        target: "http://e-learning-platform-3.runasp.net/",
        changeOrigin: true,
      },
      "/Videos": {
        target: "http://e-learning-platform-3.runasp.net/",
        changeOrigin: true,
      },
      "/Files": {
        target: "http://e-learning-platform-3.runasp.net/",
        changeOrigin: true,
      },
    },
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, ".."),
      ],
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));