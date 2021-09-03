import { Store as BaseStore } from "@/store";
import { RowData } from "@/types";

export interface Actions {
    setHoveredRow: string | undefined;
    selectRows: string[];
    appendRows: RowData[];
    clear: undefined;
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

    constructor() {
        super({
            setHoveredRow: [],
            selectRows: [],
            appendRows: [],
            clear: [],
        }, initialState);

        this.handle('appendRows', (state, rows) => {

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

            // Reset row indexes
            const rowIndexes: Record<string, number> = {};
            rows = [...state.rows, ...rows];
            rows.forEach((r, i) => {
                rowIndexes[r.id] = i;
            })

            return { ...state, rows, rowIndexes };
        });

        this.handle('setHoveredRow', (state, row) => {
            if (row === undefined || state.rowIndexes[row] !== undefined) {
                return { ...state, hoveredRow: row };
            }

            return state;
        });

        this.handle('selectRows', (state, rows) => {
            rows = rows.filter(r => {
                return state.rowIndexes[r] !== undefined;
            });

            return { ...state, selectedRows: rows };
        });

        this.handle('clear', (state) => {
            return { ...state, rowIndexes: {}, rows: [], hoveredRow: undefined, selectedRows: [] };
        });
    }
}

export default Store;
