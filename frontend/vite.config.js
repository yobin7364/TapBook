import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Critical for Netlify

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000", // Your backend URL
      },
    },
  },
});
