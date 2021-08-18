export interface Styles {
    [key: string]: string;
}

export interface RowData {
    [key: string]: any;
}

export interface ColumnOptions {
    field: string;
    width?: number; // default is 200
    minWidth?: number; // default is 50
    flex?: number;
    headerName?: string;
    resizable?: boolean;
    pinned?: 'left' | 'right';
}

export interface GridOptions {
    container: HTMLElement;
    width?: string; // default is 100%
    height?: string; // default is 100%
    columns: ColumnOptions[];
    rows: RowData[];
    // headers
    headerHeight?: number; // default is 30
    // row
    rowHeight?: number; // default is 28
}
