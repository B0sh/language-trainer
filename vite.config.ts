import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const shoelaceAssetsPath = 'node_modules/@shoelace-style/shoelace/dist/assets/*'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /\/assets\/icons\/(.+)/,
        replacement: `${shoelaceAssetsPath}/$1`,
      },
    ],
  },
  build: {
    rollupOptions: {
      plugins: [],
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: shoelaceAssetsPath,
          dest: 'assets',
        },
      ],
    }),
    react()
  ],
});
