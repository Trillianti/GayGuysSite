import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 50000,
    https: {
      key: fs.readFileSync(path.resolve('C:/nginx/certs/localhost.key')), // Путь к вашему приватному ключу
      cert: fs.readFileSync(path.resolve('C:/nginx/certs/localhost.crt')), // Путь к вашему SSL-сертификату
    },
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
