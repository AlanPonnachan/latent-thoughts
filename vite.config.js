import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


const BASE = '/from-paper-to-code/'

export default defineConfig({
  plugins: [react()],
  base: BASE,
  // Allow importing .md files as raw strings
  assetsInclude: ['**/*.md'],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': ['react-markdown', 'remark-math', 'remark-gfm', 'rehype-katex', 'rehype-prism-plus'],
          'mermaid': ['mermaid'],
        }
      }
    }
  }
})
