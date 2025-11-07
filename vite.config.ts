import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // Added for path resolution

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      // Standard alias for resolving '@/' to the 'src' directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})