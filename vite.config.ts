import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';

// Ganti dengan domain kamu
const siteUrl = 'https://internet-test-app.vercel.app/';

export default defineConfig({
  base: siteUrl,
  plugins: [
    react(),
    sitemap({
      hostname: siteUrl,
      generateRobotsTxt: true,
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
