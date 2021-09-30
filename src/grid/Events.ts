import CellRange from "@/selection/CellRange";
import { FillRange } from "@/selection/FillRange";
import { CellPosition, ColumnPinned, RowPinned } from "@/types";
import { useSelector } from "./store";
import Grid from ".";

export const Events = {
    /**
     * Cell events
     */
    selectedCellsChanged: (grid: Grid, cb: (current?: CellRange, now?: CellRange[], before?: CellRange[]) => void) => {
        return grid.store('cell').subscribe('selectCells', (params, newState, oldState) => {
            cb(
                new CellRange(params.start, params.end),
                newState.selections,
                oldState.selections
            );
        });
    },
    editingCellChanged: (grid: Grid, cb: (cell?: CellPosition, old?: CellPosition) => void) => {
        return grid.store('cell').subscribe('setEditing', (cell, _, oldState) => {
            cb(cell, oldState.editing);
        });
    },
    fillingRangeChanged: (grid: Grid, cb: (range?: FillRange, old?: FillRange) => void) => {
        return grid.store('cell').subscribe('setFilling', (range, _, oldState) => {
            cb(range, oldState.filling);
        });
    },
    cellValueChanged: (grid: Grid, cb: (cell?: CellPosition, value?: any) => void) => {
        return grid.store('row').subscribe('setCellValue', (payload) => {
            cb({ row: payload.row, column: payload.column }, payload.value);
        });
    },
    /**
     * Row events
     */
    rowPinnedChanged: (grid: Grid, cb: (row?: string, pinned?: RowPinned) => void) => {
        const unsubscribes: (() => void)[] = [];

        unsubscribes.push(grid.store('row').subscribe('setPinnedTopRows', (rows) => {
            rows.forEach((row) => cb(row, 'top'));
        }));
        unsubscribes.push(grid.store('row').subscribe('setPinnedBottomRows', (rows) => {
            rows.forEach((row) => cb(row, 'bottom'));
        }));
        unsubscribes.push(grid.store('row').subscribe('takePinnedRows', (rows) => {
            rows.forEach((row) => cb(row, undefined));
        }));

        return () => {
            unsubscribes.forEach(f => f());
        };
    },
    rowBaseHeightChanged: (grid: Grid, cb: (height?: number) => void) => {
        return grid.store('row').subscribe('setBaseHeight', cb);
    },
    selectedRowsChanged: (grid: Grid, cb: (rows?: string[]) => void) => {
        return grid.store('row').subscribe('selectRows', cb);
    },
    rowsChanged: (grid: Grid, cb: () => void) => {
        const s = useSelector(grid.store('row'), (state) => {
            return { rows: state.rows };
        }, cb);
        return s.cancel;
    },
    rowAdded: (grid: Grid, cb: (row?: string) => void) => {
        return grid.store('row').subscribe('appendRowsBefore', ({ rows }) => {
            rows.forEach(r => cb(r.id));
        });
    },
    rowRemoved: (grid: Grid, cb: (row?: string) => void) => {
        return grid.store('row').subscribe('takeRows', (rows) => {
            rows.forEach(r => cb(r));
        });
    },
    /**
     * Column events
     */
    columnsChanged: (grid: Grid, cb: () => void) => {
        return grid.store('column').subscribe('setColumns', cb);
    },
    columnHeightChanged: (grid: Grid, cb: (height?: number) => void) => {
        return grid.store('column').subscribe('setHeight', cb);
    },
    columnPinnedChanged: (grid: Grid, cb: (column?: string, pinned?: ColumnPinned) => void) => {
        return grid.store('column').subscribe('updateColumnPinned', ({ field, pinned }) => {
            cb(field, pinned);
        });
    },
    columnVisibleChanged: (grid: Grid, cb: (column?: string, visible?: boolean) => void) => {
        return grid.store('column').subscribe('updateColumnVisible', ({ field, visible }) => {
            cb(field, visible);
        });
    },
    columnWidthChanged: (grid: Grid, cb: (column?: string, width?: number) => void) => {
        return grid.store('column').subscribe('updateColumnWidth', ({ field, width }) => {
            cb(field, width);
        });
    },
    columnNameChanged: (grid: Grid, cb: (column?: string, name?: string) => void) => {
        return grid.store('column').subscribe('updateColumnName', ({ field, name }) => {
            cb(field, name);
        });
    },
    groupCollapsedChanged: (grid: Grid, cb: (group?: string, collapsed?: boolean) => void) => {
        return grid.store('column').subscribe('updateGroupCollapsed', ({ group, collapsed }) => {
            cb(group, collapsed);
        });
    },
    groupNameChanged: (grid: Grid, cb: (group?: string, name?: string) => void) => {
        return grid.store('column').subscribe('updateGroupName', ({ group, name }) => {
            cb(group, name);
        });
    },
}

export default Events;
