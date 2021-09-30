import {
    BaseColumnOptions, Boundary,
    CellPosition, ColumnOptions,
    ColumnsDef, Coordinate,
    GridOptions, GroupData,
    MenuItem, Pinned,
    RowData,
    Unsubscribe
} from '@/types';
import defaultRender from '@/views';
import { Root, RootState } from '@/grid/store';
import { Store as GridStore } from '@/grid/store/grid';
import { Store as RowStore } from '@/grid/store/row';
import { Store as CellStore } from '@/grid/store/cell';
import { Store as ColumnStore } from '@/grid/store/column';
import CellRange from '@/selection/CellRange';
import { readTextFromClipboard, writeTextToClipboard } from '@/utils';
import { Observer, Handlers } from './Observer';
import Actions from './Actions';
import { Events, EventsDef } from './Events';

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

    protected observer: Observer<EventsDef, typeof Actions>;

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
                height: props.headerHeight,
                getColumnMenuItems: props.getColumnMenuItems,
            })
        });

        this.setColumns(props.columns, props.defaultColumnOption);
        this.appendRows(props.rows);

        this.observer = new Observer(this, Events, Actions);

        render(this, container);
    }

    public getRoot() {
        return this.root;
    }

    public appendChild<T extends Node>(node: T): T {
        if (!node || this.container.firstChild.contains(node)) return node;
        return this.container.firstChild.appendChild(node);
    }

    public removeChild<T extends Node>(node: T): T {
        if (!node || !this.container.firstChild.contains(node)) return node;
        return this.container.firstChild.removeChild(node);
    }

    public getRootElement(): HTMLElement {
        return this.container.firstChild as HTMLElement;
    }

    // event binding.
    public on<
        K extends keyof typeof Actions | keyof EventsDef,
        H extends Handlers<typeof Actions, EventsDef>,
    >(event: K, handler: H[K]): Unsubscribe {
        return this.observer.on(event, handler);
    }

    // event trigger
    public trigger<K extends keyof EventsDef>(e: K, ...args: Parameters<EventsDef[K]>): boolean {
        return this.observer.trigger(e, ...args);
    }

    /**
     * Internal
     */

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

    public getColumnMenuItems(column: string): MenuItem[] {
        if (this.state('column').getColumnMenuItems) {
            return this.state('column').getColumnMenuItems({ column: column, grid: this });
        }

        return [];
    }

    public getState(): State {
        return this.root.getState();
    }

    public store<K extends keyof Stores>(s: K) {
        return this.root.store(s);
    }

    public state<K extends keyof Stores>(s: K) {
        return this.root.state(s);
    }

    /**
     * Actions for grid
     */

    // destroy the current grid, the destroyed grid can no longer be used,
    // the destruction of the grid is asynchronous
    public destroy(): Promise<void> {
        this.store('grid').destroy();
        return new Promise<void>(resolve => {
            setTimeout(resolve, 0);
        });
    }

    // set the loading state of the grid
    public setLoading(loading: boolean) {
        return this.store('grid').dispatch('setLoading', loading);
    }

    // get grid loading state
    public isLoading(): boolean {
        return this.state('grid').loading;
    }

    // copy the currently selected cell data to the clipboard.
    public copySelection(): void {
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

    // parse the data from the clipboard and
    // set the selected cell data according to the order.
    public pasteFromClipboard(): void {
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
     * Actions for cell
     */

    // get cell coordinates based on row id and column field.
    public getCoordinate(row: string, col: string): Coordinate {
        const pos = {
            x: this.store('column').getColumnIndex(col),
            y: this.store('row').getRowIndex(row)
        };

        if (pos.x == -1 || pos.y == -1) {
            return { x: -1, y: -1 };
        }

        return pos;
    }

    // get the row id and column field of the cell according to the cell coordinates.
    public getCellPosition(coord: Coordinate): CellPosition {
        return {
            row: this.getRowIdByIndex(coord.y),
            column: this.getColumnByIndex(coord.x)
        };
    }

    // get the row data of the cell according to the cell position.
    public getRawCellValue(row: string, column: string): any {
        return this.store('row').getRawCellValue(row, column);
    }

    // get the row data of the cell according to the cell coordinates.
    public getRawCellValueByCoord(coord: Coordinate): any {
        return this.getRawCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x)
        );
    }

    // Get cell data with transformer applied
    public getCellValue(row: string, column: string): any {
        const columnOptions = this.getColumnOptions(column, row);
        const trans = columnOptions?.transformer;
        const value = this.getRawCellValue(row, column);

        return trans ? trans.format({ value, column: columnOptions, gird: this }) : value;
    }

    public getCellValueByCoord(coord: Coordinate): any {
        return this.getCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x)
        );
    }

    // set cell value according to cell position
    public setCellValue(row: string, column: string, value: any): void {
        const oldValue = this.getRawCellValue(row, column);
        const columnOptions = this.getColumnOptions(column, row);

        if (oldValue === undefined || columnOptions === undefined || columnOptions.readonly) {
            return;
        }

        const trans = columnOptions.transformer;
        value = trans ? trans.parse({ value, column: columnOptions, gird: this }) : value;
        this.store('row').dispatch('setCellValue', { row, column, value });
    }

    public setCellValueByCoord(coord: Coordinate, value: any): void {
        return this.setCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x),
            value
        );
    }

    // stop the cell being edited
    public stopEditing(): void {
        this.store('cell').stopEditing();
    }

    // enable editing for the cell at the specified location.
    public setEditing(pos?: CellPosition): void {
        this.store('cell').setEditing(pos);
    }

    // select cells
    public selectCells(start: Coordinate, end: Coordinate): void {
        return this.store('cell').dispatch('selectCells', { start, end });
    }

    // deselect all cells
    public deselectAllCells(): void {
        return this.store('cell').dispatch('selectCells', undefined);
    }

    // get the selection area where the cell is located
    public getCoordLocatedRange(coord: Coordinate): CellRange | undefined {
        return this.store('cell').getCoordLocatedRange(coord);
    }

    /**
     * Actions for column
     */

    // get the options of the column, if the row parameter is not undefined,
    // it will try to return to the application columnOptionsSelector
    public getColumnOptions(column: string, row: string = undefined): ColumnOptions {
        const options = this.store('column').getColumnOptions(column);
        if (row === undefined || options?.columnOptionsSelector === undefined) {
            return options;
        }

        return Object.assign({}, options, options.columnOptionsSelector({ row, gird: this }));
    }

    public getColumnOptionsByIndex(x: number, y: number = undefined): ColumnOptions {
        if (y !== undefined) {
            return this.getColumnOptions(
                this.getColumnByIndex(x),
                this.store('row').getRowIdByIndex(y)
            );
        }
        return this.store('column').getColumnOptionsByIndex(x);
    }

    // get the column `field` according to the index of the column.
    public getColumnByIndex(x: number): string {
        return this.store('column').getColumnByIndex(x);
    }

    public getPinnedLeftColumns(): string[] {
        return this.state('column').pinnedLeftColumns;
    }

    public getPinnedRightColumns(): string[] {
        return this.state('column').pinnedRightColumns;
    }

    public getNoPinnedColumns(): string[] {
        return this.state('column').normalColumns;
    }

    public setColumns(columns: ColumnsDef, defaultOptions?: BaseColumnOptions): void {
        return this.store('column').dispatch('setColumns', { columns, defaultOptions });
    }

    public setColumnName(field: string, name: string): void {
        return this.store('column').dispatch('updateColumnName', { field, name });
    }

    public setColumnPinned(field: string, pinned: Pinned): void {
        return this.store('column').dispatch('updateColumnPinned', { field, pinned });
    }

    public setColumnVisible(field: string, visible: boolean): void {
        return this.store('column').dispatch('updateColumnVisible', { field, visible });
    }

    public setColumnWidth(field: string, params: { width?: number, flex?: number }): void {
        return this.store('column').dispatch('updateColumnWidth', {
            field, width: params.width, flex: params.flex
        });
    }

    public setColumnHeight(height: number): void {
        return this.store('column').dispatch('setHeight', height);
    }

    // get all groups
    public getGroups(): GroupData[] {
        return Object.values(this.state('column').groupsData);
    }

    // get group data by id
    public getGroupData(group: string): GroupData | undefined {
        return this.state('column').groupsData[group];
    }

    public setGroupCollapsed(group: string, collapsed: boolean): void {
        return this.store('column').dispatch('updateGroupCollapsed', { group, collapsed });
    }

    public toggleGroupCollapsed(group: string): void {
        return this.store('column').toggleGroupCollapsed(group);
    }

    public setGroupName(group: string, name: string): void {
        return this.store('column').dispatch('updateGroupName', { group, name });
    }

    /**
     * Actions for row
     */

    public getRowIdByIndex(y: number): string {
        return this.store('row').getRowIdByIndex(y);
    }

    public getRowIndex(id: string): number {
        return this.store('row').getRowIndex(id);
    }

    public getRowDataByIndex(y: number): RowData {
        return this.store('row').getRowDataByIndex(y);
    }

    public getRowData(row: string): RowData {
        return this.store('row').getRowData(row);
    }

    // append rows to the end of the grid.
    public appendRows(rows: RowData[]): void {
        return this.store('row').appendRows(rows);
    }

    // append new rows before the specified row in the grid.
    public appendRowsBefore(index: number, rows: RowData[]): void {
        return this.store('row').appendRowsBefore(index, rows);
    }

    // remove rows
    public removeRows(rows: string[]): void {
        return this.store('row').dispatch('takeRows', rows);
    }

    // clear all rows.
    public clearRows(): void {
        return this.store('row').dispatch('clear', undefined);
    }

    // get the selected rows
    public getSelectedRows(): string[] {
        return this.state('row').selectedRows;
    }

    // select rows
    public selectRows(rows: string[]): void {
        return this.store('row').selectRows(rows);
    }

    // append new rows to the selected rows.
    public appendSelectedRows(rows: string[]): void {
        return this.store('row').appendSelectedRows(rows);
    }

    // deselect the specified row from the selected rows.
    public takeSelectedRow(row: string): void {
        return this.store('row').takeSelectedRow(row);
    }

    // get all row ids, excluding pinned rows.
    public getRowIds(): string[] {
        return this.store('row').getRowIds();
    }

    // get all pinned top rows.
    public getPinnedTopRows(): string[] {
        return this.store('row').getPinnedTopRows();
    }

    // set pinned top rows.
    public setPinnedTopRows(rows: string[]): void {
        return this.store('row').setPinnedTopRows(rows);
    }

    // append new rows to the pinned top rows.
    public appendPinnedTopRows(rows: string[]): void {
        return this.store('row').appendPinnedTopRows(rows);
    }

    // get all pinned bottom rows.
    public getPinnedBottomRows(): string[] {
        return this.store('row').getPinnedBottomRows();
    }

    // set pinned bottom rows.
    public setPinnedBottomRows(rows: string[]): void {
        return this.store('row').setPinnedBottomRows(rows);
    }

    // append new rows to the pinned bottom rows.
    public appendPinnedBottomRows(rows: string[]): void {
        return this.store('row').appendPinnedBottomRows(rows);
    }

    // unpin the rows.
    public takePinnedRows(rows: string[]): void {
        return this.store('row').takePinnedRows(rows);
    }

    // get whether the row is pinned at the top.
    public isPinnedTop(row: string): boolean {
        return this.store('row').isPinnedTop(row);
    }

    // get whether the row is pinned at the bottom.
    public isPinnedBottom(row: string): boolean {
        return this.store('row').isPinnedBottom(row);
    }

    // get whether the row is pinned.
    public isPinnedRow(row: string): boolean {
        return this.store('row').isPinnedRow(row);
    }

    // set the base row height.
    public setRowBaseHeight(height: number): void {
        return this.store('row').dispatch('setBaseHeight', height);
    }
}

export default Grid;
