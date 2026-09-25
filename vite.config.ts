import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/nucleus-pulse-04/' : '/',
    server: {
      // 3001 and 3002 belong to PULSE 01 and 02.
      port: 3004,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Two pages, one app: the experience, and the facilitator's screen. The
    // dashboard is its own entry so nothing of it ships to a participant.
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
