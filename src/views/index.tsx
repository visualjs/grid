import Grid from "@/grid";
import { hydrate as p } from 'preact';
import { Root as RootProvider } from '@/views/root';
import { useLayoutEffect, useState } from "preact/hooks";
import GridRoot from '@/views/grid';

import '@/fonts.css';

function App(props: { grid: Grid }) {

    const [state, setState] = useState({ destroyed: false });

    useLayoutEffect(() => {
        return props.grid.store('grid').subscribe('destroy', () => {
            setState({ destroyed: true });
        });
    }, []);

    return !state.destroyed && (
        <RootProvider grid={props.grid}>
            <GridRoot />
        </RootProvider>
    );
}

export function render(grid: Grid, container: HTMLElement) {
    p(<App grid={grid} />, container);
}

export default render;
