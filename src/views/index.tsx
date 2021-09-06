import Grid from "@/grid";
import { render as p } from 'preact';
import { Root as RootProvider } from '@/views/root';
import GridRoot from '@/views/grid';

import '@/fonts.css';

export function render(grid: Grid, container: HTMLElement) {
    p((
        <RootProvider grid={grid}>
            <GridRoot />
        </RootProvider>
    ), container);
}

export default render;
