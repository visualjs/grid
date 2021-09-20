import { Store as BaseStore } from "@/grid/store";
import { RowData } from "@/types";
import { diff, unique } from "@/utils";
import update from 'immutability-helper';

export interface Actions {
    setCellValue: {
        row: string;
        column: string;
        value: any
    };
    setPinnedTopRows: string[];
    setPinnedBottomRows: string[];
    takePinnedRows: string[];
    setHoveredRow: string | undefined;
    selectRows: string[];
    appendRowsBefore: { index: number, rows: RowData[] };
    takeRows: string[];
    clear: undefined;
    setBaseHeight: number;
}

export interface State {
    rows: Record<string, RowData>;
    pinnedTopRows: string[];
    pinnedBottomRows: string[];
    normalRows: string[];
    hoveredRow?: string;
    selectedRows: string[];
    height: number;
}

const initialState: State = {
    rows: {},
    pinnedTopRows: [],
    pinnedBottomRows: [],
    normalRows: [],
    selectedRows: [],
    height: 28,
};

export class Store extends BaseStore<State, Actions> {

    constructor(initial?: Partial<State>) {
        super({
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
        }, Object.assign({}, initialState, initial));

        this.handle('setCellValue', (state, { row, column, value }) => {
            const index = this.getRowIndex(row);
            if (index === -1) return state;

            return update(state, {
                rows: {
                    [row]: { [column]: { $set: value } }
                }
            });
        });

        this.handle('appendRowsBefore', (state, { index, rows }) => {

            // If the newly added row already exists,
            // use the new data to overwrite the old data
            // and do not add a new one
            const params: any = {};
            rows.forEach(r => {
                params[r.id] = { $set: r };
            });
            const rowsData = update(state.rows, params);

            const row = this.getRowIdByIndex(index);

            // Append new rows in the pinned top rows
            if (this.isPinnedTop(row)) {
                return update(state, {
                    rows: { $set: rowsData },
                    pinnedTopRows: {
                        $set: [
                            ...state.pinnedTopRows.slice(0, index),
                            ...diff(rows.map(r => r.id), state.pinnedTopRows),
                            ...state.pinnedTopRows.slice(index, state.pinnedTopRows.length)
                        ]
                    },
                });
            }

            // Global index to local index
            index -= this._state.pinnedTopRows.length;
            // Append new rows in the pinned bottom rows
            if (this.isPinnedBottom(row)) {
                index -= this._state.normalRows.length;
                return update(state, {
                    rows: { $set: rowsData },
                    pinnedBottomRows: {
                        $set: [
                            ...state.pinnedBottomRows.slice(0, index),
                            ...diff(rows.map(r => r.id), state.pinnedBottomRows),
                            ...state.pinnedBottomRows.slice(index, state.pinnedBottomRows.length)
                        ]
                    },
                });
            }

            index = Math.max(index, 0);
            return update(state, {
                rows: { $set: rowsData },
                normalRows: {
                    $set: [
                        ...state.normalRows.slice(0, index),
                        ...diff(rows.map(r => r.id), state.normalRows),
                        ...state.normalRows.slice(index, state.normalRows.length)
                    ]
                },
            });
        });

        this.handle('takeRows', (state, takeRows) => {
            return update(state, {
                pinnedTopRows: { $set: diff(state.pinnedTopRows, takeRows) },
                pinnedBottomRows: { $set: diff(state.pinnedBottomRows, takeRows) },
                normalRows: { $set: diff(state.normalRows, takeRows) },
                rows: { $unset: takeRows },
            });
        });

        this.handle('setHoveredRow', (state, row) => {
            if (row === undefined || this.getRowIndex(row) !== -1) {
                return update(state, {
                    hoveredRow: { $set: row }
                });
            }

            return state;
        });

        this.handle('selectRows', (state, rows) => {
            rows = this.getValidRows(rows);

            return update(state, {
                selectedRows: { $set: rows }
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

            return update(state, {
                pinnedTopRows: { $set: diff(state.pinnedTopRows, rows) },
                pinnedBottomRows: { $set: diff(state.pinnedBottomRows, rows) },
                normalRows: { $set: unique(state.normalRows.concat(rows)) },
            });
        });

        this.handle('clear', (state) => {
            return update(state, {
                rows: { $set: {} },
                pinnedTopRows: { $set: [] },
                pinnedBottomRows: { $set: [] },
                normalRows: { $set: [] },
                hoveredRow: { $set: undefined },
                selectedRows: { $set: [] }
            });
        });

        this.handle('setBaseHeight', (state, height) => {
            return update(state, {
                height: { $set: height }
            });
        });
    }

    protected getValidRows(rows: string[]): string[] {
        return rows.filter((r, i) => {
            // valid row and remove duplicates
            return this.getRowIndex(r) !== -1 && rows.indexOf(r, 0) === i;
        });
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

    public appendSelectRows(rows: string[]) {
        rows = [...this._state.selectedRows, ...rows];
        return this.dispatch('selectRows', rows);
    }

    public takeSelectRow(row: string) {
        const i = this._state.selectedRows.indexOf(row);
        if (i === -1) {
            return;
        }

        return this.dispatch('selectRows', update(this._state.selectedRows, {
            $splice: [[i, 1]]
        }));
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
        return this._state.rows[row];
    }

    // Get the original cell data without applying transformer
    public getRawCellValue(row: string, column: string): any {
        const index = this.getRowIndex(row);
        if (index === -1) {
            return undefined;
        }

        if (column === '#') {
            return index + 1;
        }

        return this._state.rows[row][column];
    }
}

export default Store;
