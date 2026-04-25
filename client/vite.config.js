import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/book':          'http://localhost:4000',
      '/blocked-dates': 'http://localhost:4000',
      '/admin':         'http://localhost:4000',
    },
  },
})
