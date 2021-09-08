import { Store as BaseStore } from "@/grid/store";
import { RowData } from "@/types";
import update from 'immutability-helper';

export interface Actions {
    setCellValue: {
        row: string;
        column: string;
        value: any
    };
    setHoveredRow: string | undefined;
    selectRows: string[];
    appendRows: RowData[];
    appendRowsBefore: { index: number, rows: RowData[] };
    takeRows: string[];
    clear: undefined;
    setBaseHeight: number;
}

export interface State {
    rows: RowData[];
    rowIndexes: Record<string, number>;
    hoveredRow?: string;
    selectedRows: string[];
    height: number;
}

const initialState: State = {
    rows: [],
    rowIndexes: {},
    selectedRows: [],
    height: 28,
};

export class Store extends BaseStore<State, Actions> {

    constructor(initial?: Partial<State>) {
        super({
            setCellValue: [],
            setHoveredRow: [],
            selectRows: [],
            appendRows: [],
            appendRowsBefore: [],
            takeRows: [],
            clear: [],
            setBaseHeight: [],
        }, Object.assign({}, initialState, initial));

        this.handle('setCellValue', (state, { row, column, value }) => {
            const index = state.rowIndexes[row];
            if (index === undefined) return state;

            return update(state, {
                rows: {
                    [index]: { [column]: { $set: value } }
                }
            });
        });

        this.handle('appendRows', (state, rows) => {
            return this.appendRowsBefore(state, state.rows.length, rows);
        });

        this.handle('appendRowsBefore', (state, { index, rows }) => {
            return this.appendRowsBefore(state, index, rows);
        });

        this.handle('takeRows', (state, takeRows) => {

            takeRows = takeRows.filter((row) => {
                return state.rowIndexes[row] !== undefined;
            });

            const rows = state.rows.filter(r => {
                return takeRows.indexOf(r.id) === -1;
            });

            // Reset row indexes
            const rowIndexes: Record<string, number> = {};
            rows.forEach((r, i) => {
                rowIndexes[r.id] = i;
            });

            return update(state, {
                rowIndexes: { $set: rowIndexes },
                rows: { $set: rows },
            });
        });

        this.handle('setHoveredRow', (state, row) => {
            if (row === undefined || state.rowIndexes[row] !== undefined) {
                return update(state, {
                    hoveredRow: { $set: row }
                });
            }

            return state;
        });

        this.handle('selectRows', (state, rows) => {
            rows = rows.filter(r => {
                return state.rowIndexes[r] !== undefined;
            });

            return update(state, {
                selectedRows: { $set: rows }
            });
        });

        this.handle('clear', (state) => {
            return update(state, {
                rowIndexes: { $set: {} },
                rows: { $set: [] },
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

    protected appendRowsBefore(state: State, index: number, rows: RowData[]) {

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

        index = Math.max(index, 0);
        rows = [
            ...state.rows.slice(0, index),
            ...rows,
            ...state.rows.slice(index, state.rows.length)
        ];

        // Reset row indexes
        const rowIndexes: Record<string, number> = {};
        rows.forEach((r, i) => {
            rowIndexes[r.id] = i;
        });

        return { ...state, rows, rowIndexes };
    }

    public getRowIds() {
        return this._state.rows.map(r => r.id);
    }

    public getRowIdByIndex(y: number) {
        return this._state.rows[y].id;
    }

    public getRowIndex(id: string) {
        return this._state.rowIndexes[id];
    }

    // Get the original cell data without applying transformer
    public getRawCellValue(row: string, column: string): any {
        const index = this._state.rowIndexes[row];
        if (index === undefined) {
            return undefined;
        }

        if (column === '#') {
            return index + 1;
        }

        return this._state.rows[index][column];
    }
}

export default Store;