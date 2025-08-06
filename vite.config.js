import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
// 1. Import the new plugin
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Modern, reliable way to get the directory path
const __dirname = dirname(fileURLToPath(import.meta.url));

// This script automatically finds all .html files in your 'src' folder
const input = readdirSync(resolve(__dirname, 'src'))
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = file.substring(0, file.length - 5);
    acc[name] = resolve(__dirname, 'src', file);
    return acc;
  }, {});

export default defineConfig({
  root: 'src',
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src', '_partials'),
    }),
    // 2. Add and configure the plugin
    viteStaticCopy({
      targets: [
        {
          src: 'data', // Path to the folder in 'src'
          dest: '.'    // Destination in the 'dist' folder ('.' means the root)
        }
      ]
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