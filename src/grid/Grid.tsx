import { Emitter } from '@/observer/Emitter';
import CellRange from '@/selection/CellRange';
import { ColumnOptions, GridOptions, Coordinate, BaseColumnOptions, CellPosition } from '@/types';
import Root from '@/grid/root';
import { EventsTypes, GridEvents } from './Events';
import { render } from 'preact';

import '@/fonts.css';

const defaultGridOptions = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    rowHeight: 28,
    preloadRowCount: 20,
}

const defaultColumnOptions: BaseColumnOptions = {
    width: 200,
    minWidth: 50,
};

class Grid extends Emitter<EventsTypes> {

    // save ordered column fields
    protected pinnedLeftColumns: string[] = [];

    protected pinnedRightColumns: string[] = [];

    protected normalColumns: string[] = [];

    // use the column field as the key, and the column option as the value
    protected columns: Record<string, ColumnOptions> = {};

    // save row's id and index as map
    protected rows: Record<string, number> = {};

    protected selections: CellRange[] = [];

    protected selectedRows: string[] = [];

    protected hoveredRow?: string;

    constructor(protected container: HTMLElement, protected props: GridOptions) {

        super(new GridEvents());

        this.props = Object.assign({ grid: this }, defaultGridOptions, props);

        this.props.columns.forEach(col => {
            col = Object.assign({}, defaultColumnOptions, props.defaultColumnOption, col);

            if (col.pinned == 'left') {
                this.pinnedLeftColumns.push(col.field);
            } else if (col.pinned == 'right') {
                this.pinnedRightColumns.push(col.field);
            } else {
                this.normalColumns.push(col.field);
            }

            this.columns[col.field] = col;
        })

        this.props.rows.forEach((r, i) => {
            this.rows[r.id] = i;
        })

        render(<Root
            grid={this}
            pinnedLeftColumns={this.pinnedLeftColumns}
            pinnedRightColumns={this.pinnedRightColumns}
            normalColumns={this.normalColumns}
            {...this.props}
        />, container);

        this.addListener('selectionChanged', (selections) => {
            this.selections = selections;
        })

        this.addListener('columnWidthChanged', (params) => {
            this.columns[params.field].width = params.width;
        })
    }

    public getOptions(): GridOptions {
        return this.props;
    }

    // 
    // Columns
    // 

    public getColumnOptions(field: string) {
        return this.columns[field];
    }

    // 
    // Rows
    // 

    public getRows() {
        return this.props.rows;
    }

    public getRowKeys() {
        return Object.keys(this.rows);
    }

    public getRowHeight() {
        return this.props.rowHeight;
    }

    public setHoveredRow(row?: string) {
        if (this.hoveredRow !== row) {
            this.hoveredRow = row;
            this.trigger('hoveredRowChanged', row);
        }
    }

    public selectRows(rows: string[]) {
        this.selectedRows = rows;
        this.trigger('selectedRowsChanged', rows);
    }

    public getSelectedRows(): string[] {
        return this.selectedRows;
    }

    // 
    // Coordinates and cells
    // 

    public getCoordinate(row: string, col: string): Coordinate {
        const pos = { x: -1, y: this.rows[row] };
        const opt = this.columns[col];

        if (!opt) {
            return pos;
        }

        if (opt.pinned === 'left') {
            pos.x = this.pinnedLeftColumns.findIndex(c => c == col);
        } else if (opt.pinned === 'right') {
            pos.x = this.pinnedRightColumns.findIndex(c => c == col);
            if (pos.x !== -1) {
                pos.x = pos.x + this.pinnedLeftColumns.length + this.normalColumns.length;
            }
        } else if (opt.pinned === undefined) {
            pos.x = this.normalColumns.findIndex(c => c == col);
            if (pos.x !== -1) {
                pos.x = pos.x + this.pinnedLeftColumns.length;
            }
        }

        return pos;
    }

    public getRowIdByIndex(y: number) {
        return this.props.rows[y].id;
    }

    public getColumnByIndex(x: number) {
        if (x < this.pinnedLeftColumns.length) {
            return this.pinnedLeftColumns[x];
        }

        x -= this.pinnedLeftColumns.length;
        if (x < this.normalColumns.length) {
            return this.normalColumns[x];
        }

        x -= this.normalColumns.length;
        return this.pinnedRightColumns[x];
    }

    public setCellValue(row: string, column: string, value: any) {
        const index = this.rows[row];
        if (index === undefined) {
            return;
        }

        if (this.props.rows[index][column] === undefined) {
            return;
        }

        const trans = this.columns[column]?.transformer;
        value = trans ? trans.parse({ value, column: this.columns[column] }) : value;

        const oldValue = this.props.rows[index][column];
        this.props.rows[index][column] = value;

        this.trigger('cellValueChanged', { row, column, value, oldValue });
    }

    public setCellValueByCoord(coord: Coordinate, value: any) {
        return this.setCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x),
            value
        );
    }

    // Get the original cell data without applying transformer
    public getRawCellValue(row: string, column: string): any {
        const index = this.rows[row];
        if (index === undefined) {
            return undefined;
        }

        return this.props.rows[index][column];
    }

    // Get cell data with transformer applied
    public getCellValue(row: string, column: string): any {
        const columnOptions = this.columns[column];
        const trans = columnOptions?.transformer;
        const value = this.getRawCellValue(row, column);

        return trans ? trans.format({ value, column: columnOptions }) : value;
    }

    public getRawCellValueByCoord(coord: Coordinate) {
        return this.getRawCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x)
        );
    }

    public getCellValueByCoord(coord: Coordinate) {
        return this.getCellValue(
            this.getRowIdByIndex(coord.y),
            this.getColumnByIndex(coord.x)
        );
    }

    // 
    // Editing
    // 

    public startEditingCell(pos: CellPosition) {
        this.trigger('startCellEditing', pos);
    }

    public stopEditing() {
        this.trigger('stopEditing');
    }

    // 
    // Selections
    // 

    public getCoordLocatedRange(coord: Coordinate): CellRange | undefined {
        for (let i = 0; i < this.selections.length; i++) {
            if (this.selections[i].contains(coord)) {
                return this.selections[i];
            }
        }
    }

    public getSelectionRanges() {
        return this.selections;
    }

    public selectCells(start: Coordinate, end: Coordinate) {
        this.trigger('selectionChanged', [
            new CellRange(start, end)
        ]);
    }
}

export default Grid;
