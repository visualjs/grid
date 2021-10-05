import { CellRenderer, CellEditor, CellTransformer } from "@/grid/cell";
import { JSXInternal } from "preact/src/jsx";
import Grid from "./grid";

export type Unsubscribe = () => void;

export interface MenuItem {
    // is it a dividing line
    separator?: boolean;
    // disabled menu items
    disabled?: boolean;
    // display name
    name?: string;
    // icon
    icon?: string;
    // callback after the menu item is clicked
    action?: () => void;
    subMenus?: MenuItem[];
}

export interface GetColumnMenuItemsParams {
    // the column that was clicked
    column: string;
    grid: Grid;
}

export interface GetContextMenuItemsParams {
    // the row that was clicked
    row: string;
    // the column that was clicked
    column: string;
    grid: Grid;
}

export interface RowClassParams {
    row: string;
    grid: Grid;
}

export interface CellClassParams {
    row: string;
    column: string;
    grid: Grid;
};

export interface Styles {
    [key: string]: string;
}

export interface CellPosition {
    row: string;
    column: string;
}

export interface Coordinate {
    x: number;
    y: number;
}

export interface Boundary {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}

export interface RowData {
    // row id
    id: string;
    [key: string]: any;
}

interface ICellRenderer {
    new(): CellRenderer<unknown>;
}

interface ICellEditor {
    new(): CellEditor<unknown>;
}

export type RowPinned = 'top' | 'bottom' | undefined;
export type ColumnPinned = 'left' | 'right' | undefined;
export type Pinned = ColumnPinned;

export interface GroupData {
    id: string;
    headerName: string;
    columns: string[];
    collapsed?: boolean;
    collapsible?: boolean;
}

export interface ColumnSelectorParams {
    row: string;
    gird: Grid;
}

// for column options overridden by columnOptionsSelector
export interface OverridableColumnOptions {
    // when a cell is read-only, the cellEditor will be invalid,
    // and the value of the cell cannot be modified even if the drop-down fill is
    readonly?: boolean;
    // format the reading and writing of cell data
    transformer?: CellTransformer;
    // cellRenderer to use for this column
    cellRender?: ICellRenderer;
    // cellEditor to use for this column
    cellEditor?: ICellEditor;
    // params to be passed to cell renderer and cell editor component
    cellParams?: any;
    // an object of css values for a particular cell.
    cellStyle?: JSXInternal.CSSProperties;
    // callback version of property cellStyle to set style for a particular cell.
    // function should return an object of CSS values.
    getCellStyle?: (params: CellClassParams) => JSXInternal.CSSProperties;
    // class to use for the cell. can be an array of strings.
    cellClass?: string[];
    // callback version of property cellClass to set class(es) for a particular cell.
    // function should return an array of strings (array of class names).
    getCellClass?: (params: CellClassParams) => string[];
}

// BaseColumnOptions can be overridden by default column options
export interface BaseColumnOptions extends OverridableColumnOptions {
    // column width, default is 200
    width?: number;
    // the minimum width supported when adjusting the column width, default is 50
    minWidth?: number;
    // use flex layout, let the column fill the remaining space by default
    flex?: number;
    // can the column width be adjusted by dragging
    resizable?: boolean;
    // whether the column is visible, default is true
    visible?: boolean;
    // 'left' | 'right' | undefined
    pinned?: Pinned;
    // columnOptionsSelector is a callback to apply different options to the same column of cells in different rows
    columnOptionsSelector?: (params: ColumnSelectorParams) => OverridableColumnOptions;
}

// column definition
export interface ColumnOptions extends BaseColumnOptions {
    // column id
    field: string;
    // column name
    headerName?: string;
}

// definition of column grouping 
export interface ColumnGroupOptions {
    // group id
    id?: string;
    // group name
    headerName?: string;
    // whether column grouping is collapsed by default, default is false
    collapsed?: boolean;
    // whether the column group can be collapsed, default is false
    collapsible?: boolean;
    // a subset of groups, can be multiple groups or columns
    children: (ColumnGroupOptions | ColumnOptions)[];
}

export type ColumnDef = (ColumnGroupOptions | ColumnOptions);
export type ColumnsDef = ColumnDef[];

export type Fillable = 'x' | 'y' | 'xy' | undefined;

export interface GridOptions {
    // grid width, default is 100%
    width?: string;
    // grid height, default is 100%
    height?: string;
    // array of Column Definitions.
    columns: ColumnsDef;
    // a default column definition.
    defaultColumnOption?: BaseColumnOptions;
    // callback called when a column menu icon is clicked.
    getColumnMenuItems?: (params: GetColumnMenuItemsParams) => MenuItem[] | undefined;
    // default grid data
    rows: RowData[];
    // default column height, default is 30
    headerHeight?: number;
    // default row height, default is 28
    rowHeight?: number;
    // providing a CSS style for the rows.
    rowStyle?: JSXInternal.CSSProperties;
    // callback version of property rowStyle to set style for each row individually.
    // function should return an object of CSS values.
    getRowStyle?: (params: RowClassParams) => JSXInternal.CSSProperties;
    // CSS class(es) for all rows. provide an array of strings (array of class names).
    rowClass?: string[];
    // callback version of property rowClass to set class(es) for each row individually.
    // function should return an array of strings (array of class names).
    getRowClass?: (params: RowClassParams) => string[];
    // virtual list, default is 20
    preloadRowCount?: number;
    // whether to enable the grid drop-down to fill data, 'x' | 'y' | 'xy' | undefined
    fillable?: Fillable;
    // callback called when a cell is right clicked.
    getContextMenuItems?: (params: GetContextMenuItemsParams) => MenuItem[];
}
