import { Store as BaseStore } from '@/grid/store';
import { RowClassParams, RowData } from '@/types';
import { JSXInternal } from 'preact/src/jsx';
import { diff } from '@/utils';
import update from 'immutability-helper';

export interface Actions {
    setCellValue: {
        row: string;
        column: string;
        value: any;
        force: boolean;
    };
    setPinnedTopRows: string[];
    setPinnedBottomRows: string[];
    takePinnedRows: string[];
    setHoveredRow: string | undefined;
    selectRows: string[];
    appendRowsBefore: { index: number; rows: RowData[] };
    takeRows: string[];
    clear: undefined;
    setBaseHeight: number;
}

export interface State {
    rows: RowData[];
    rowIndexes: Record<string, number>;
    pinnedTopRows: string[];
    pinnedBottomRows: string[];
    normalRows: string[];
    hoveredRow?: string;
    selectedRows: string[];
    height: number;
    rowStyle?: JSXInternal.CSSProperties;
    getRowStyle?: (params: RowClassParams) => JSXInternal.CSSProperties;
    rowClass?: string[];
    getRowClass?: (params: RowClassParams) => string[];
}

const initialState: State = {
    rows: [],
    rowIndexes: {},
    pinnedTopRows: [],
    pinnedBottomRows: [],
    normalRows: [],
    selectedRows: [],
    height: 28,
};

export class Store extends BaseStore<State, Actions> {
    constructor(initial?: Partial<State>) {
        super(
            {
                setCellValue: [],
                setPinnedBottomRows: [],
                setPinnedTopRows: [],
                takePinnedRows: [],
                setHoveredRow: [],
                selectRows: [],
                appendRowsBefore: [],
                takeRows: [],
                clear: [],
                setBaseHeight: [],
            },
            Object.assign({}, initialState, initial)
        );

        this.handle('setCellValue', (state, { row, column, value, force }) => {
            const index = this.getRowInternalIndex(row);
            if (index === undefined) return state;

            //  skip update if newValue and oldValue is the same
            if (!force && this.getRowData(row)[column] === value) {
                return state;
            }

            return update(state, {
                rows: {
                    [index]: { [column]: { $set: value } },
                },
            });
        });

        this.handle('appendRowsBefore', (state, { index, rows }) => {
            const row = this.getRowIdByIndex(index);
            let pinnedTopRows = state.pinnedTopRows.slice();
            let pinnedBottomRows = state.pinnedBottomRows.slice();
            let internalIndex = this.getRowInternalIndex(row) || 0;

            // If the newly added row already exists,
            // use the new data to overwrite the old data
            // and do not add a new one
            rows = rows.filter((row) => {
                const i = state.rowIndexes[row.id];
                if (i !== undefined) {
                    state.rows[i] = row;
                    return false;
                }
                return true;
            });

            // Append new rows in the pinned top rows
            if (this.isPinnedTop(row)) {
                pinnedTopRows = [
                    ...state.pinnedTopRows.slice(0, index),
                    ...diff(
                        rows.map((r) => r.id),
                        state.pinnedTopRows
                    ),
                    ...state.pinnedTopRows.slice(index, state.pinnedTopRows.length),
                ];
            }

            // Global index to local index
            index -= this._state.pinnedTopRows.length;
            // Append new rows in the pinned bottom rows
            if (this.isPinnedBottom(row)) {
                index -= this._state.normalRows.length;
                pinnedBottomRows = [
                    ...state.pinnedBottomRows.slice(0, index),
                    ...diff(
                        rows.map((r) => r.id),
                        state.pinnedBottomRows
                    ),
                    ...state.pinnedBottomRows.slice(index, state.pinnedBottomRows.length),
                ];
            }

            internalIndex = Math.max(internalIndex, 0);
            rows = [...state.rows.slice(0, internalIndex), ...rows, ...state.rows.slice(internalIndex, state.rows.length)];

            // Reset row indexes
            const rowIndexes: Record<string, number> = {};
            rows.forEach((r, i) => {
                rowIndexes[r.id] = i;
            });

            index = Math.max(index, 0);

            //  Remove row ids from these who already in pinned Top/Bottom Arr
            const existedRowsId = [].concat(pinnedTopRows).concat(pinnedBottomRows);
            const newNormalRows = [
                ...state.normalRows.slice(0, index),
                ...diff(
                    rows.map((r) => r.id),
                    state.normalRows
                ),
                ...state.normalRows.slice(index, state.normalRows.length),
            ].filter((rowId) => {
                return !existedRowsId.includes(rowId);
            });

            //  emit pinned events
            this.setPinnedTopRows(pinnedTopRows.slice());
            this.setPinnedBottomRows(pinnedBottomRows.slice());

            return update(state, {
                rows: { $set: rows },
                rowIndexes: { $set: rowIndexes },
                normalRows: {
                    $set: newNormalRows,
                },
                pinnedTopRows: {
                    $set: pinnedTopRows,
                },
                pinnedBottomRows: {
                    $set: pinnedBottomRows,
                },
            });
        });

        this.handle('takeRows', (state, takeRows) => {
            takeRows = takeRows.filter((row) => {
                return state.rowIndexes[row] !== undefined;
            });

            const rows = state.rows.filter((r) => {
                return takeRows.indexOf(r.id) === -1;
            });

            // Reset row indexes
            const rowIndexes: Record<string, number> = {};
            rows.forEach((r, i) => {
                rowIndexes[r.id] = i;
            });

            return update(state, {
                pinnedTopRows: { $set: diff(state.pinnedTopRows, takeRows) },
                pinnedBottomRows: { $set: diff(state.pinnedBottomRows, takeRows) },
                normalRows: { $set: diff(state.normalRows, takeRows) },
                rows: { $set: rows },
                rowIndexes: { $set: rowIndexes },
            });
        });

        this.handle('setHoveredRow', (state, row) => {
            if (row === undefined || this.getRowIndex(row) !== -1) {
                return update(state, {
                    hoveredRow: { $set: row },
                });
            }

            return state;
        });

        this.handle('selectRows', (state, rows) => {
            rows = this.getValidRows(rows);

            return update(state, {
                selectedRows: { $set: rows },
            });
        });

        this.handle('setPinnedTopRows', (state, rows) => {
            rows = this.getValidRows(rows);

            return update(state, {
                pinnedTopRows: { $set: rows },
                pinnedBottomRows: { $set: diff(state.pinnedBottomRows, rows) },
                normalRows: { $set: diff(state.normalRows, rows) },
            });
        });

        this.handle('setPinnedBottomRows', (state, rows) => {
            rows = this.getValidRows(rows);

            return update(state, {
                pinnedTopRows: { $set: diff(state.pinnedTopRows, rows) },
                pinnedBottomRows: { $set: rows },
                normalRows: { $set: diff(state.normalRows, rows) },
            });
        });

        this.handle('takePinnedRows', (state, rows) => {
            rows = this.getValidRows(rows);
            const pinnedTopRows = diff(state.pinnedTopRows, rows);
            const pinnedBottomRows = diff(state.pinnedBottomRows, rows);
            const normalsRows = diff(
                state.rows.map((r) => r.id),
                pinnedTopRows,
                pinnedBottomRows
            );

            return update(state, {
                pinnedTopRows: { $set: pinnedTopRows },
                pinnedBottomRows: { $set: pinnedBottomRows },
                normalRows: { $set: normalsRows },
            });
        });

        this.handle('clear', (state) => {
            return update(state, {
                rows: { $set: {} },
                pinnedTopRows: { $set: [] },
                pinnedBottomRows: { $set: [] },
                normalRows: { $set: [] },
                hoveredRow: { $set: undefined },
                selectedRows: { $set: [] },
            });
        });

        this.handle('setBaseHeight', (state, height) => {
            return update(state, {
                height: { $set: height },
            });
        });
    }

    protected getValidRows(rows: string[]): string[] {
        return rows.filter((r, i) => {
            // valid row and remove duplicates
            return this.getRowIndex(r) !== -1 && rows.indexOf(r, 0) === i;
        });
    }

    protected getRowInternalIndex(row: string) {
        return this._state.rowIndexes[row];
    }

    public appendRowsBefore(index: number, rows: RowData[]) {
        return this.dispatch('appendRowsBefore', { index, rows });
    }

    public appendRows(rows: RowData[]) {
        return this.dispatch('appendRowsBefore', {
            index: this._state.pinnedTopRows.length + this._state.normalRows.length,
            rows: rows,
        });
    }

    public selectRows(rows: string[]) {
        return this.dispatch('selectRows', rows);
    }

    public appendSelectedRows(rows: string[]) {
        rows = [...this._state.selectedRows, ...rows];
        return this.dispatch('selectRows', rows);
    }

    public takeSelectedRow(row: string) {
        const i = this._state.selectedRows.indexOf(row);
        if (i === -1) {
            return;
        }

        return this.dispatch(
            'selectRows',
            update(this._state.selectedRows, {
                $splice: [[i, 1]],
            })
        );
    }

    public setPinnedTopRows(rows: string[]) {
        return this.dispatch('setPinnedTopRows', rows);
    }

    public appendPinnedTopRows(rows: string[]) {
        rows = [...this._state.pinnedTopRows, ...rows];
        return this.dispatch('setPinnedTopRows', rows);
    }

    public setPinnedBottomRows(rows: string[]) {
        return this.dispatch('setPinnedBottomRows', rows);
    }

    public appendPinnedBottomRows(rows: string[]) {
        rows = [...this._state.pinnedBottomRows, ...rows];
        return this.dispatch('setPinnedBottomRows', rows);
    }

    public takePinnedRows(rows: string[]) {
        return this.dispatch('takePinnedRows', rows);
    }

    public isPinnedTop(row: string) {
        return this._state.pinnedTopRows.indexOf(row) !== -1;
    }

    public isPinnedBottom(row: string) {
        return this._state.pinnedBottomRows.indexOf(row) !== -1;
    }

    public isPinnedRow(row: string) {
        return this.isPinnedTop(row) || this.isPinnedBottom(row);
    }

    public getPinnedTopRows() {
        return this._state.pinnedTopRows;
    }

    public getPinnedBottomRows() {
        return this._state.pinnedBottomRows;
    }

    public getRowIds() {
        return this._state.normalRows;
    }

    public getRowIdByIndex(y: number) {
        if (y < this._state.pinnedTopRows.length) {
            return this._state.pinnedTopRows[y];
        }

        y -= this._state.pinnedTopRows.length;
        if (y < this._state.normalRows.length) {
            return this._state.normalRows[y];
        }

        y -= this._state.normalRows.length;
        return this._state.pinnedBottomRows[y];
    }

    public getRowIndex(id: string) {
        let index = this._state.pinnedTopRows.indexOf(id);
        if (index !== -1) {
            return index;
        }

        index = this._state.normalRows.indexOf(id);
        if (index !== -1) {
            return index + this._state.pinnedTopRows.length;
        }

        index = this._state.pinnedBottomRows.indexOf(id);
        if (index !== -1) {
            return index + this._state.pinnedTopRows.length + this._state.normalRows.length;
        }

        return index;
    }

    public getRowDataByIndex(y: number) {
        return this.getRowData(this.getRowIdByIndex(y));
    }

    public getRowData(row: string) {
        return this._state.rows[this.getRowInternalIndex(row)];
    }

    // Get the original cell data without applying transformer
    public getRawCellValue(row: string, column: string): any {
        const index = this.getRowInternalIndex(row);
        if (index === undefined) {
            return undefined;
        }

        if (column === '#') {
            return index + 1;
        }

        return this._state.rows[index][column];
    }

    public getRowsBetween(start: number, end: number): string[] {
        const s = Math.min(start, end);
        const e = Math.max(start, end);

        const rows: string[] = [];

        for (let i = s; i <= e; i++) {
            const row = this.getRowIdByIndex(i);
            row !== undefined && rows.push(row);
        }

        return rows;
    }
}

export default Store;
