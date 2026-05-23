import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Utilizes modern block-scoping in compiled outputs
    rollupOptions: {
      output: {
        // Segregates third-party script chunks from your core application logic
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react', 'qrcode'],
        },
      },
    },
  },
})