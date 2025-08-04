import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: false,
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: 'adminpanel.tagis.fi',
    allowedHosts: [
      'adminpanel.tagis.fi',
      'www.adminpanel.tagis.fi'
    ]
  }
})
