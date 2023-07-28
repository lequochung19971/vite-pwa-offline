import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: { exclude: ['fsevents'] },
  plugins: [
    react(),
    VitePWA({
      manifest: {
        icons: [
          {
            src: '/react-icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      strategies: 'injectManifest',
      // srcDir: 'src',
      // filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
