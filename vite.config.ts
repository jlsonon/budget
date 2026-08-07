import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'og-image.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mochi Money',
        short_name: 'MochiMoney',
        description: 'Your cozy financial companion',
        theme_color: '#F9A8D4',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: '/mochi-icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/mochi-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          webllm: ['@mlc-ai/web-llm'],
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'recharts', 'lucide-react'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
