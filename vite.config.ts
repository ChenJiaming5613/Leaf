import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages serves the site under https://<user>.github.io/<repo>/,
// so production builds need the repository name as base path.
const REPO_NAME = 'Leaf';

export default defineConfig(({ command }) =>
({
    base: command === 'build' ? `/${REPO_NAME}/` : '/',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        target: 'es2022',
        outDir: 'dist',
        sourcemap: true,
    },
}));
