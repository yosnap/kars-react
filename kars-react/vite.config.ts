import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // Ensure media files are served correctly
  publicDir: 'public',
  assetsInclude: ['**/*.webp', '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif'],
});
