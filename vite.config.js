import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    esbuild: {
        jsxFactory: 'h',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
            generateScopedName: 'v-grid-[local]'
        }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'VisualJS',
            fileName: (format) => `visual-grid.${format}.js`
        }
    }
})
