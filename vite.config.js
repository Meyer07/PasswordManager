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
        manualChunks(id)
        {
          if(id.includes('node_modules/react') ||
          id.includes('node_modules/react-dom')||
          id.includes('node_modules/lucide-react')||
          id.includes('node_modules/qrcode'))
          {
            return 'vender';
          }
        },
      },
    },
  },
})