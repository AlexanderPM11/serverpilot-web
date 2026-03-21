import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:5242'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
        manifest: {
          name: 'ServerPilot Gateway',
          short_name: 'ServerPilot',
          description: 'Mission-critical server management console with real-time SSH uplink.',
          theme_color: '#020617',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: '/logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: '/pwa-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          ws: true  // handles both HTTP and WebSocket upgrades for /api/** routes
        },
        '/ws/terminal': {
          target: apiUrl,
          ws: true
        }
      }
    }
  }
})

