import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@braingoat/compiler"],
  },
  build: {
    commonjsOptions: {
      include: [/compiler/, /node_modules/]
    }
  }
});
