import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/game-developer-assignment/',
    build: {
        outDir: 'docs',
        emptyOutDir: true,
    },
});
