/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built site opens offline straight from dist/index.html
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
