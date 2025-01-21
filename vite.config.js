import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist', // Папка, куда будет собираться проект (по умолчанию dist)
    sourcemap: true, // Включить sourcemaps для отладки в production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Отделить библиотеки в отдельный chunk
        },
      },
    },
  },
})
