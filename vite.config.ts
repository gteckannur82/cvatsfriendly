import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      // Remote bindings (Workers AI) need `wrangler login`. Opt in with CF_REMOTE_BINDINGS=true.
      remoteBindings: process.env.CF_REMOTE_BINDINGS === 'true',
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})
