import { Boundary, CellPosition, Coordinate, GridOptions, MenuItem, RowData } from '@/types';
import defaultRender from '@/views';
import { Listener, Root, RootState } from '@/grid/store';
import { Store as GridStore } from '@/grid/store/grid';
import { Store as RowStore } from '@/grid/store/row';
import { Store as CellStore } from '@/grid/store/cell';
import { Store as ColumnStore } from '@/grid/store/column';
import CellRange from '@/selection/CellRange';
import { readTextFromClipboard, writeTextToClipboard } from '@/utils';

const defaultGridOptions = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    rowHeight: 28,
    preloadRowCount: 20,
}

export interface Stores {
    grid: GridStore;
    row: RowStore;
    cell: CellStore;
    column: ColumnStore;
}

export type Store = Root<Stores>;
export type State = RootState<Stores>;

export class Grid {

    protected root: Store;

    constructor(protected container: HTMLElement, props: GridOptions, render = defaultRender) {

        props = Object.assign({ grid: this }, defaultGridOptions, props);

        this.root = new Root({
            grid: new GridStore({
                width: props.width,
                height: props.height,
                preloadRowCount: props.preloadRowCount,
                fillable: props.fillable,
                getContextMenuItems: props.getContextMenuItems,
            }),
            row: new RowStore({ height: props.rowHeight }),
            cell: new CellStore(),
            column: new ColumnStore({
                height: props.headerHeight
            })
        });

        this.store('column').dispatch('setColumns', {
            columns: props.columns, defaultOptions: props.defaultColumnOption
        });

        this.appendRows(props.rows);

        render(this, container);
    }

    public api() {
        return this.root;
    }

    /**
     * Agent for root store
     */

    public getState(): State {
        return this.root.getState();
    }

    public subscribe(listener: Listener<unknown, State>) {
        return this.root.subscribeAny(listener);
    }

    public store<K extends keyof Stores>(s: K) {
        return this.root.store(s);
    }

    public state<K extends keyof Stores>(s: K) {
        return this.root.state(s);
    }

    /**
     * Actions
     */

    public getCoordinate(row: string, col: string): Coordinate {
        const opt = this.state('column').columns[col];

        if (this.state('row').rowIndexes[row] === undefined || opt === undefined) {
            return { x: -1, y: -1 };
        }

        const pos = { x: -1, y: this.state('row').rowIndexes[row] };

        if (opt.pinned === 'left') {
            pos.x = this.state('column').pinnedLeftColumns.findIndex(c => c == col);
        } else if (opt.pinned === 'right') {
            pos.x = this.state('column').pinnedRightColumns.findIndex(c => c == col);
            if (pos.x !== -1) {
                pos.x = pos.x + this.state('column').pinnedLeftColumns.length + this.state('column').normalColumns.length;
            }
        } else if (opt.pinned === undefined) {
            pos.x = this.state('column').normalColumns.findIndex(c => c == col);
            if (pos.x !== -1) {
                pos.x = pos.x + this.state('column').pinnedLeftColumns.length;
            }
        }

        return pos;
    }

    public getCellPosition(coord: Coordinate): CellPosition {
        return {
            row: this.getRowIdByIndex(coord.y),
            column: this.getColumnByIndex(coord.x)
        };
    }

    public getRawCellValueByCoord(coord: Coordinate) {
        return this.getRawCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x)
        );
    }

    // Get cell data with transformer applied
    public getCellValue(row: string, column: string): any {
        const columnOptions = this.getColumnOptions(column);
        const trans = columnOptions?.transformer;
        const value = this.getRawCellValue(row, column);

        return trans ? trans.format({ value, column: columnOptions, gird: this }) : value;
    }

    public getCellValueByCoord(coord: Coordinate) {
        return this.getCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x)
        );
    }

    public setCellValue(row: string, column: string, value: any) {
        const oldValue = this.getRawCellValue(row, column);
        const columnOptions = this.getColumnOptions(column);

        if (oldValue === undefined || columnOptions === undefined) {
            return;
        }

        const trans = columnOptions.transformer;
        value = trans ? trans.parse({ value, column: columnOptions, gird: this }) : value;
        this.store('row').dispatch('setCellValue', { row, column, value });
    }

    public setCellValueByCoord(coord: Coordinate, value: any) {
        return this.setCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x),
            value
        );
    }

    public getSelectBoundary(row: string, column: string): Boundary | undefined {

        const coord = this.getCoordinate(row, column);

        const range = this.getCoordLocatedRange(coord);
        if (range === undefined) {
            return undefined;
        }

        let boundary = { left: false, top: false, bottom: false, right: false };
        range.isLeft(coord) && (boundary.left = true);
        range.isRight(coord) && (boundary.right = true);
        range.isTop(coord) && (boundary.top = true);
        range.isBottom(coord) && (boundary.bottom = true);

        return boundary;
    }

    public getFillingBoundary(row: string, column: string): Boundary | undefined {
        const coord = this.getCoordinate(row, column);
        const range = this.state('cell').filling;

        if (range === undefined || !range.contains(coord)) {
            return undefined;
        }

        let boundary = { left: false, top: false, bottom: false, right: false };
        range.isLeft(coord) && (boundary.left = true);
        range.isRight(coord) && (boundary.right = true);
        range.isTop(coord) && (boundary.top = true);
        range.isBottom(coord) && (boundary.bottom = true);

        return boundary;
    }

    public getContextMenuItems(pos: CellPosition): MenuItem[] {
        if (this.state('grid').getContextMenuItems) {
            return this.state('grid').getContextMenuItems({ ...pos, grid: this });
        }

        return [];
    }

    // Copy the currently selected cell data to the clipboard
    public copySelection() {
        let text = '';
        this.state('cell').selections.forEach((range) => {
            let lastRow = -1;
            range.each(coord => {
                if (lastRow !== -1) {
                    text += coord.y !== lastRow ? '\n' : '\t';
                }

                text += this.getCellValueByCoord(coord);
                lastRow = coord.y;
            });
        })

        writeTextToClipboard(text);
    }

    // Parse the data from the clipboard and
    // set the selected cell data according to the order
    public pasteFromClipboard() {
        const start = this.state('cell').selections[0]?.start;
        if (!start) return;

        readTextFromClipboard().then(str => {
            str = str.replace(/(\r\n|\r|\n)/g, '\n');
            str.split('\n').forEach((rowData, y) => {
                rowData.split('\t').forEach((value, x) => {
                    const coord = { x: x + start.x, y: y + start.y };
                    this.setCellValueByCoord(coord, value);
                });
            });
        });
    }

    /**
     * Agent for column store
     */

    public getColumnOptions(column: string) {
        return this.store('column').getColumnOptions(column);
    }

    public getColumnOptionsByIndex(x: number) {
        return this.store('column').getColumnOptionsByIndex(x);
    }

    public getColumnByIndex(x: number) {
        return this.store('column').getColumnByIndex(x);
    }

    /**
     * Agent for row store
     */

    public appendRows(rows: RowData[]) {
        return this.store('row').appendRows(rows);
    }

    public appendRowsBefore(index: number, rows: RowData[]) {
        return this.store('row').appendRowsBefore(index, rows);
    }

    public appendSelectRows(rows: string[]) {
        return this.store('row').appendSelectRows(rows);
    }

    public takeSelectRow(row: string) {
        return this.store('row').takeSelectRow(row);
    }

    public getRowIdByIndex(y: number) {
        return this.store('row').getRowIdByIndex(y);
    }

    public getRowIndex(id: string) {
        return this.store('row').getRowIndex(id);
    }

    public getRawCellValue(row: string, column: string): any {
        return this.store('row').getRawCellValue(row, column);
    }

    public getRowDataByIndex(y: number) {
        return this.store('row').getRowDataByIndex(y);
    }

    public getRowData(row: string) {
        return this.store('row').getRowData(row);
    }

    /**
     * Agent for cell store
     */

    public getCoordLocatedRange(coord: Coordinate): CellRange | undefined {
        return this.store('cell').getCoordLocatedRange(coord);
    }
}

export default Grid;
