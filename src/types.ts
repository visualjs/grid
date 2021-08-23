import { CellRenderer } from "@/grid/cell";

export interface Styles {
    [key: string]: string;
}

export interface Coordinate {
    x: number;
    y: number;
}

export interface RowData {
    id: string;
    [key: string]: any;
}

interface ICellRenderer {
    new (): CellRenderer<unknown>;
}

export interface BaseColumnOptions {
    width?: number; // default is 200
    minWidth?: number; // default is 50
    flex?: number;
    resizable?: boolean;
    pinned?: 'left' | 'right';
    cellRender?: ICellRenderer;
    cellRendererParams?: any;
}

export interface ColumnOptions extends BaseColumnOptions {
    field: string;
    headerName?: string;
}

export interface GridOptions {
    width?: string; // default is 100%
    height?: string; // default is 100%
    columns: ColumnOptions[];
    defaultColumnOption?: BaseColumnOptions;
    rows: RowData[];
    // headers
    headerHeight?: number; // default is 30
    // row
    rowHeight?: number; // default is 28
    // virtual list
    preloadRowCount?: number; // default is 10
}
