import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api calls go to the Express server (in production one Express server serves both).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
  // @bb/shared (validation schemas used by client and server) is CommonJS so Node can require() it.
  // These two settings let Vite convert it for the browser in dev and in the production build.
  optimizeDeps: { include: ['@bb/shared'] },
  build: { commonjsOptions: { include: [/shared/, /node_modules/] } },
});
