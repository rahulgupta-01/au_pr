import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to create the input object for Rollup
const input = readdirSync(resolve(__dirname, 'src'))
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = file.substring(0, file.length - 5);
    acc[name] = resolve(__dirname, 'src', file);
    return acc;
  }, {});

export default defineConfig({
  // Setting the root to 'src' means all paths are relative to it.
  root: 'src',
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src', '_partials'),
    }),
    // This plugin copies directories that Vite doesn't know about, like your data files.
    viteStaticCopy({
      targets: [
        {
          // Because root is 'src', the path is now just 'data'.
          src: 'data',
          dest: '.' // This copies it to the root of the 'dist' folder.
        },
        {
          // Also copy the images folder, as it's referenced directly in HTML.
          src: 'images',
          dest: '.'
        },
        {
          src: 'robots.txt',
          dest: '.'
        },
        {
          src: 'sitemap.xml',
          dest: '.'
        }
      ]
    }),
    // The PWA plugin will automatically generate the service worker.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*'],
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}'],
        navigateFallback: 'index.html',
        // This is the new part that caches the Font Awesome files
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fontawesome-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Australian PR Journey',
        short_name: 'PR Journey',
        description: 'A personal dashboard for tracking Australian PR progress.',
        theme_color: '#00529B',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'assets/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          // Adding the apple-touch-icon to the manifest
          {
            src: 'assets/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input,
    },
  },
});