import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Critical for Netlify

  server: {
    port: 5100, // Replace with your desired port
    strictPort: true, // Optional: throws error if port is already in use
    proxy: {
      "/api": {
        target: "http://localhost:4000", // Your backend URL
      },
    },
  },
});
