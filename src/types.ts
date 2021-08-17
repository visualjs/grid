import { ColumnProps } from "./column";

export interface Styles {
    [key: string]: string;
}

export interface RowData {
    [key: string]: any;
}

export interface GridOptions {
    container: HTMLElement;
    width?: string; // default is 100%
    height?: string; // default is 100%
    columns: ColumnProps[];
    rows: RowData[];
    // headers
    headerHeight?: number; // default is 30
    // row
    rowHeight?: number; // default is 28
}
