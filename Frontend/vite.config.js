import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy mirrors production: Nginx forwards /api to FastAPI bound on
// 127.0.0.1:8000, so the dashboard always talks to a same-origin /api.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
