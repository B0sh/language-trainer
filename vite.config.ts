/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const shoelaceAssetsPath = 'node_modules/@shoelace-style/shoelace/dist/assets/*';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{
      find: /\/assets\/icons\/(.+)/,
      replacement: `${shoelaceAssetsPath}/$1`
    }]
  },
  build: {
    rollupOptions: {
      plugins: []
    }
  },
  plugins: [viteStaticCopy({
    targets: [{
      src: shoelaceAssetsPath,
      dest: 'assets'
    }]
  }), react()],
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});