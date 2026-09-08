import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server proxies /api/* to your Flask backend so the browser
// never has to worry about CORS while developing locally.
// Change the target below if your Flask API runs on a different port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
