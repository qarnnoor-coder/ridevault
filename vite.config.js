import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ridevault/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "RideVault",
        short_name: "RideVault",
        description: "Numbered helmet lockers that lock and unlock from your phone.",
        theme_color: "#16130f",
        background_color: "#100e0c",
        display: "standalone",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
}));
