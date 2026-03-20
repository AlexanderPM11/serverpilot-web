import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'ServerPilot',
        short_name: 'ServerPilot',
        description: 'Manage your Linux servers from your mobile',
        theme_color: '#0a0a0c',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5242',
        changeOrigin: true,
        ws: true  // handles both HTTP and WebSocket upgrades for /api/** routes
      },
      '/ws/terminal': {
        target: 'http://localhost:5242',
        ws: true
      }
    }
  }
})
