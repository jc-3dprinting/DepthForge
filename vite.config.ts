import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Transformers.js loads the ONNX Runtime Web WASM binary from the jsdelivr CDN at
// runtime (its default `wasmPaths` in src/backends/onnx.js). However,
// `ort.wasm.min.mjs` references the ~26MB `ort-wasm-simd-threaded.asyncify.wasm`
// via `new URL(..., import.meta.url)`, which makes Vite emit it as a bundled
// asset. That asset is never used (the runtime fetches from CDN), but it exceeds
// Cloudflare Workers' 25 MiB per-asset limit and blocks deployment.
//
// This plugin drops ONNX Runtime `.wasm` assets from the build output so the
// bundle stays under the limit, while the CDN-loaded runtime remains intact.
function stripOrtWasmAssets(): Plugin {
  return {
    name: 'strip-ort-wasm-assets',
    apply: 'build',
    generateBundle(_opts, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.wasm')) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), stripOrtWasmAssets()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@huggingface/transformers'],
  },
});
