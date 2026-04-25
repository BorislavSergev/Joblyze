import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          markdown: ['react-markdown'],
          icons:    ['react-icons'],
          gemini:   ['@google/genai'],
          pdfjs:    ['pdfjs-dist'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
