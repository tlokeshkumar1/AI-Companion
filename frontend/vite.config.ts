import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/bots': 'http://localhost:8000',
      '/chat': 'http://localhost:8000'
    }
  }
});