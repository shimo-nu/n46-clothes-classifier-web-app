import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from "vite-plugin-static-copy";
import env from "vite-plugin-env-compatible";
import fs from 'fs'
import path from 'path'

// SSL証明書の設定
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, './certs/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, './certs/cert.pem')),
}

// import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tsconfigPaths(),
    env({ prefix: "VITE", mountedPath: "process.env" }),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/onnxruntime-web/dist/*.wasm",
          dest: "./",
        },
      ],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    https: httpsOptions,
    hmr: {
      clientPort: 8080,
      protocol: 'wss'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
