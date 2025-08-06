import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import { readdirSync } from 'fs';

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
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true, // <-- Add this line
    rollupOptions: {
      // This input map is now correctly included
      input,
    },
  },
});