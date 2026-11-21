import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "mono-white.svg"],
      manifest: {
        name: "Cay Sarah · Bitácora",
        short_name: "Cay Sarah",
        description: "Bitácora de a bordo: viajes, mantenimiento, finanzas y bitácora del catamarán Cay Sarah.",
        lang: "es",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#13213A",
        theme_color: "#13213A",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i, handler: "CacheFirst", options: { cacheName: "fuentes", expiration: { maxEntries: 20, maxAgeSeconds: 31536000 } } },
        ],
      },
    }),
  ],
});
