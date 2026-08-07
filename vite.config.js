import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative asset paths work on both:
// - https://USERNAME.github.io/REPOSITORY/
// - a custom domain such as https://sap.ginkgo.land/
export default defineConfig({
  plugins: [react()],
  base: './',
});
