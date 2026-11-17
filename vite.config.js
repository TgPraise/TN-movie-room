import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Multi-threaded software decoding needs SharedArrayBuffer, which needs these headers.
// Without them the compatibility player still works, just single-threaded.
const isolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

// libmedia loads its worker scripts (N.avplayer.js) relative to its own entry file.
// Vite only bundles the entry, so copy those scripts next to it in assets/.
function libmediaWorkers() {
  const dir = fileURLToPath(new URL('./node_modules/@libmedia/avplayer/dist/esm', import.meta.url))
  return {
    name: 'libmedia-workers',
    apply: 'build',
    generateBundle() {
      for (const f of readdirSync(dir)) {
        if (/^\d+\.avplayer\.js$/.test(f)) {
          this.emitFile({ type: 'asset', fileName: `assets/${f}`, source: readFileSync(join(dir, f)) })
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), libmediaWorkers()],
  server: { headers: isolation },
  preview: { headers: isolation },
  optimizeDeps: { exclude: ['@libmedia/avplayer'] },
  worker: { format: 'es' },
})
