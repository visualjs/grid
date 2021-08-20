import path from 'path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
    plugins: [preact()],
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
