import { Pinned, ColumnOptions, BaseColumnOptions } from "@/types";
import { Store as BaseStore } from "@/store";
import update from 'immutability-helper';

export interface Actions {
    updateColumnPinned: { field: string, pinned: Pinned };
    updateColumnWidth: { field: string, width: number };
    setColumns: { columns: ColumnOptions[], defaultOptions?: BaseColumnOptions };
}

export interface State {
    // save ordered column fields
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    // column options
    columns: Record<string, ColumnOptions>;
    // header
    headerHeight: number;
}

const initialState: State = {
    pinnedLeftColumns: [],
    pinnedRightColumns: [],
    normalColumns: [],
    columns: {},
    headerHeight: 30,
};

export const defaultColumnOptions: BaseColumnOptions = {
    width: 200,
    minWidth: 50,
};

export class Store extends BaseStore<State, Actions> {
    constructor(initial?: Partial<State>) {
        super({
            updateColumnPinned: [],
            updateColumnWidth: [],
            setColumns: [],
        }, Object.assign({}, initialState, initial));

        this.handle('updateColumnPinned', (state, { field, pinned }) => {

            state.columns[field].pinned = pinned;

            return {
                ...state,
                ...this.setColumns(Object.values(state.columns))
            };
        });

        this.handle('updateColumnWidth', (state, { field, width }) => {
            return update(state, {
                columns: {
                    [field]: { width: { $set: width } }
                }
            });
        });

        this.handle('setColumns', (state, { columns, defaultOptions }) => {
            return {
                ...state,
                ...this.setColumns(columns, Object.assign({}, defaultColumnOptions, defaultOptions))
            };
        });
    }

    public getColumnOptions(column: string) {
        return this.state.columns[column];
    }

    protected setColumns = (columnOptions: ColumnOptions[], defaultColumnOption: BaseColumnOptions = {}) => {
        let pinnedLeftColumns: string[] = [];
        let pinnedRightColumns: string[] = [];
        let normalColumns: string[] = [];
        let columns: Record<string, ColumnOptions> = {};

        columnOptions.forEach(col => {
            col = Object.assign({}, defaultColumnOption, col);

            if (col.pinned == 'left') {
                pinnedLeftColumns.push(col.field);
            } else if (col.pinned == 'right') {
                pinnedRightColumns.push(col.field);
            } else {
                normalColumns.push(col.field);
            }

            columns[col.field] = col;
        })

        return {
            pinnedLeftColumns,
            pinnedRightColumns,
            normalColumns,
            columns
        };
    }

}

export default Store;
