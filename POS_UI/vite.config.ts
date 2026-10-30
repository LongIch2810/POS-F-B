import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode, isPreview }) => {
  const { VITE_API_TARGET } = loadEnv(mode, process.cwd(), 'VITE_');
  if (command === 'serve' && !isPreview && !VITE_API_TARGET) {
    throw new Error('Set VITE_API_TARGET in POS_UI/.env or the process environment before starting Vite.');
  }
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: VITE_API_TARGET ? { '/api': VITE_API_TARGET } : undefined,
    },
  };
});
