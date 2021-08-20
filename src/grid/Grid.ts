import { GridOptions } from '@/types';
import { createComponent, createElement, render } from '@/component';
import GridRoot from './Root';

const defaultGridOptions = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    rowHeight: 28,
}

class Grid {

    protected root: GridRoot;

    constructor(protected container: HTMLElement, protected props: GridOptions) {
        this.props = Object.assign({ grid: this }, defaultGridOptions, props);
        
        this.root = createComponent(
            createElement(GridRoot, this.props), container
        ) as GridRoot;

        render(this.root);
    }

    public getColumnOptions(col: string) {
        return this.root.getColumnOptions(col);
    }

    public getRowHeight() {
        return this.props.rowHeight;
    }
}

export default Grid;
