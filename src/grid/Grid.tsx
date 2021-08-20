import { ColumnOptions, GridOptions } from '@/types';
import { render } from 'preact';
import Root from './Root';

const defaultGridOptions = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    rowHeight: 28,
    preloadRowCount: 10,
}

const defaultColumnOptions = {
    width: 200,
    minWidth: 50,
};

class Grid {

    // save ordered column fields
    protected pinnedLeftColumns: string[] = [];

    protected pinnedRightColumns: string[] = [];

    protected normalColumns: string[] = [];

    // use the column field as the key, and the column option as the value
    protected columns: Record<string, ColumnOptions> = {};

    constructor(protected container: HTMLElement, protected props: GridOptions) {
        this.props = Object.assign({ grid: this }, defaultGridOptions, props);

        this.props.columns.forEach(col => {
            col = Object.assign({}, defaultColumnOptions, col);

            if (col.pinned == 'left') {
                this.pinnedLeftColumns.push(col.field);
            } else if (col.pinned == 'right') {
                this.pinnedRightColumns.push(col.field);
            } else {
                this.normalColumns.push(col.field);
            }

            this.columns[col.field] = col;
        })

        render(<Root
            grid={this}
            pinnedLeftColumns={this.pinnedLeftColumns}
            pinnedRightColumns={this.pinnedRightColumns}
            normalColumns={this.normalColumns}
            {...this.props}
        />, container);
    }

    public getColumnOptions(field: string) {
        return this.columns[field];
    }

    public getRows() {
        return this.props.rows;
    }

    public getRowHeight() {
        return this.props.rowHeight;
    }
}

export default Grid;
