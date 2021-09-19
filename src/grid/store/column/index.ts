import {
    Pinned, ColumnsDef, ColumnOptions,
    BaseColumnOptions, GetColumnMenuItemsParams,
    MenuItem, GroupData
} from "@/types";
import { Store as BaseStore } from "@/grid/store";
import update from 'immutability-helper';
import { normalizedColumns, paddingColumns } from "./utils";

export interface Actions {
    updateColumnPinned: { field: string, pinned: Pinned };
    updateColumnVisible: { field: string, visible: boolean };
    updateColumnWidth: { field: string, width?: number, flex?: number };
    updateColumnName: { field: string, name: string };
    updateGroupCollapsed: { group: string, collapsed: boolean };
    updateGroupName: { group: string, name: string };
    setColumns: { columns: ColumnsDef, defaultOptions?: BaseColumnOptions };
    setHeight: number;
}

export interface State {
    // save ordered column fields
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    // column options
    columns: Record<string, ColumnOptions>;
    // column groups
    groups: string[][];
    groupsData: Record<string, GroupData>;
    // header
    height: number;
    // column menus
    getColumnMenuItems?: (params: GetColumnMenuItemsParams) => MenuItem[];
}

const initialState: State = {
    pinnedLeftColumns: [],
    pinnedRightColumns: [],
    normalColumns: [],
    columns: {},
    groups: [],
    groupsData: {},
    height: 30,
};

export const defaultColumnOptions: BaseColumnOptions = {
    width: 200,
    minWidth: 50,
    visible: true,
};

export class Store extends BaseStore<State, Actions> {
    constructor(initial?: Partial<State>) {
        super({
            updateColumnPinned: [],
            updateColumnWidth: [],
            updateColumnVisible: [],
            updateColumnName: [],
            updateGroupCollapsed: [],
            updateGroupName: [],
            setColumns: [],
            setHeight: [],
        }, Object.assign({}, initialState, initial));

        this.handle('updateColumnPinned', (state, { field, pinned }) => {

            const newState = update(state, {
                columns: {
                    [field]: { pinned: { $set: pinned } }
                }
            });

            return {
                ...newState,
                ...this.setColumns(Object.values(newState.columns))
            };
        });

        this.handle('updateColumnVisible', (state, { field, visible }) => {
            const newState = update(state, {
                columns: {
                    [field]: { visible: { $set: visible } }
                }
            });

            return {
                ...newState,
                ...this.setColumns(Object.values(newState.columns))
            };
        });

        this.handle('updateColumnWidth', (state, { field, width, flex }) => {
            if (flex !== undefined) {
                return update(state, {
                    columns: {
                        [field]: { flex: { $set: flex } }
                    }
                });
            }

            return update(state, {
                columns: {
                    [field]: { width: { $set: width } }
                }
            });
        });

        this.handle('updateColumnName', (state, { field, name }) => {
            return update(state, {
                columns: {
                    [field]: { headerName: { $set: name } }
                }
            });
        });

        this.handle('setColumns', (state, { columns, defaultOptions }) => {

            const normalized = normalizedColumns(paddingColumns(columns));

            const result = this.setColumns(normalized.columns, Object.assign({}, defaultColumnOptions, defaultOptions))

            return update(state, {
                pinnedLeftColumns: { $set: result.pinnedLeftColumns },
                pinnedRightColumns: { $set: result.pinnedRightColumns },
                normalColumns: { $set: result.normalColumns },
                columns: { $set: result.columns },
                groups: { $set: normalized.groups },
                groupsData: { $set: normalized.groupsData }
            });
        });

        this.handle('updateGroupCollapsed', (state, { group, collapsed }) => {

            const columns: any = {};
            state.groupsData[group].columns.slice(1).map(c => {
                columns[c] = { visible: { $set: !collapsed } };
            });

            const newState = update(state, {
                groupsData: {
                    [group]: { collapsed: { $set: collapsed } }
                },
                columns: columns
            });

            return {
                ...newState,
                ...this.setColumns(Object.values(newState.columns))
            };
        });

        this.handle('updateGroupName', (state, { group, name }) => {
            return update(state, {
                groupsData: {
                    [group]: { headerName: { $set: name } }
                }
            });
        });

        this.handle('setHeight', (state, height) => {
            return update(state, {
                height: { $set: height },
            });
        });
    }

    protected setColumns = (columnOptions: ColumnOptions[], defaultColumnOption: BaseColumnOptions = {}) => {
        let pinnedLeftColumns: string[] = [];
        let pinnedRightColumns: string[] = [];
        let normalColumns: string[] = [];
        let columns: Record<string, ColumnOptions> = {};

        columnOptions.forEach(col => {
            col = Object.assign({}, defaultColumnOption, col);
            columns[col.field] = col;

            if (!col.visible) {
                return;
            }

            if (col.pinned == 'left') {
                pinnedLeftColumns.push(col.field);
            } else if (col.pinned == 'right') {
                pinnedRightColumns.push(col.field);
            } else {
                normalColumns.push(col.field);
            }
        })

        return {
            pinnedLeftColumns,
            pinnedRightColumns,
            normalColumns,
            columns
        };
    }

    /**
     * Actions
     */

    public getColumnOptions(column: string) {
        return this._state.columns[column];
    }

    public getColumnOptionsByIndex(x: number) {
        return this._state.columns[this.getColumnByIndex(x)];
    }

    public getColumnIndex(field: string) {
        const opt = this._state.columns[field];
        if (!opt) return -1;

        let index = -1;

        if (opt.pinned === 'left') {
            index = this._state.pinnedLeftColumns.findIndex(c => c == field);
        } else if (opt.pinned === 'right') {
            index = this._state.pinnedRightColumns.findIndex(c => c == field);
            if (index !== -1) {
                index = index + this._state.pinnedLeftColumns.length + this._state.normalColumns.length;
            }
        } else if (opt.pinned === undefined) {
            index = this._state.normalColumns.findIndex(c => c == field);
            if (index !== -1) {
                index = index + this._state.pinnedLeftColumns.length;
            }
        }

        return index;
    }

    public getColumnByIndex(x: number) {
        if (x < this._state.pinnedLeftColumns.length) {
            return this._state.pinnedLeftColumns[x];
        }

        x -= this._state.pinnedLeftColumns.length;
        if (x < this._state.normalColumns.length) {
            return this._state.normalColumns[x];
        }

        x -= this._state.normalColumns.length;
        return this._state.pinnedRightColumns[x];
    }

    public setColumnName(field: string, name: string) {
        return this.dispatch('updateColumnName', { field, name });
    }

    public getGroupWidth(id: string, columns: string[] = []) {
        const group = this._state.groupsData[id];
        if (!group) {
            return { width: 0, flex: undefined };
        }

        let width = 0;
        let flex: number = undefined;

        group.columns.forEach(c => {
            if (columns.length > 0 && columns.indexOf(c) === -1) {
                return;
            }

            const options = this.getColumnOptions(c);
            width += options?.width || 0;
            if (options?.flex) {
                flex = options?.flex;
            }
        });

        return { width, flex };
    }

    public setGroupCollapsed(group: string, collapsed: boolean) {
        return this.dispatch('updateGroupCollapsed', { group, collapsed });
    }

    public setGroupName(group: string, name: string) {
        return this.dispatch('updateGroupName', { group, name });
    }

    public toggleGroupCollapsed(group: string) {
        return this.dispatch('updateGroupCollapsed', {
            group, collapsed: !this._state.groupsData[group].collapsed
        });
    }
}

export default Store;
