import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api calls go to the Express server (Nginx does this in production).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
});
