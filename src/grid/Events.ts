import { FillRange } from '@/selection/FillRange';
import { CellPosition, Coordinate, MenuItem } from '@/types';
import { Events as EventsType } from './Observer';

export interface EventsDef {
    beforeCellDbClicked: (pos: CellPosition, ev: MouseEvent, cell: HTMLDivElement) => boolean | void;
    afterCellDbClicked: (pos: CellPosition, ev: MouseEvent, cell: HTMLDivElement) => boolean | void;
    beforeCellMouseDown: (pos: CellPosition, ev: MouseEvent, cell: HTMLDivElement) => boolean | void;
    afterCellMouseDown: (pos: CellPosition, ev: MouseEvent, cell: HTMLDivElement) => boolean | void;
    beforeCellMouseMove: (pos: CellPosition, ev: MouseEvent, cell: HTMLDivElement) => boolean | void;
    afterCellMouseMove: (pos: CellPosition, ev: MouseEvent, cell: HTMLDivElement) => boolean | void;
    beforeFillerMouseDown: (pos: CellPosition, ev: MouseEvent, filler: HTMLDivElement) => boolean | void;
    afterFillerMouseDown: (pos: CellPosition, ev: MouseEvent, filler: HTMLDivElement) => boolean | void;
    beforeFilling: (range: FillRange) => boolean | void;
    afterFilling: (range: FillRange) => boolean | void;
    beforeSelectionChange: (start: Coordinate, end: Coordinate) => boolean | void;
    afterSelectionChange: (start: Coordinate, end: Coordinate) => boolean | void;
    beforeContextMenuShow: (pos: CellPosition, items: MenuItem[]) => boolean | void;
    afterContextMenuShow: (pos: CellPosition, items: MenuItem[]) => boolean | void;
    beforeColumnResizingStart: (column: string, width: number) => boolean | void;
    afterColumnResizingStart: (column: string, width: number) => boolean | void;
    beforeColumnResizingEnd: (column: string, width: number) => boolean | void;
    afterColumnResizingEnd: (column: string, width: number) => boolean | void;
    beforeRowResizingStart: (row: string, height: number) => boolean | void;
    afterRowResizingStart: (row: string, height: number) => boolean | void;
    beforeRowResizingEnd: (row: string, height: number) => boolean | void;
    afterRowResizingEnd: (row: string, height: number) => boolean | void;
    beforeKeyDown: (ev: KeyboardEvent) => boolean | void;
    afterKeyDown: (ev: KeyboardEvent) => boolean | void;
    beforeKeyPress: (ev: KeyboardEvent) => boolean | void;
    afterKeyPress: (ev: KeyboardEvent) => boolean | void;
    beforeKeyUp: (ev: KeyboardEvent) => boolean | void;
    afterKeyUp: (ev: KeyboardEvent) => boolean | void;
    beforeCopy: (text: string) => boolean | void;
    afterCopy: (text: string) => boolean | void;
    beforePaste: (text: string) => boolean | void;
    afterPaste: (text: string) => boolean | void;
    beforeRowDragStart: (startRow: string) => boolean | void;
    afterRowDragStart: (startRow: string) => boolean | void;
    beforeRowDragEnd: (startRow: string, endRow: string) => boolean | void;
    afterRowDragEnd: (startRow: string, endRow: string) => boolean | void;
    beforeColumnDragStart: (startColumn: string) => boolean | void;
    afterColumnDragStart: (startColumn: string) => boolean | void;
    beforeColumnDragEnd: (startColumn: string, endColumn: string) => boolean | void;
    afterColumnDragEnd: (startColumn: string, endColumn: string) => boolean | void;
}

export const Events: EventsType<EventsDef> = {
    beforeCellDbClicked: [],
    afterCellDbClicked: [],
    beforeCellMouseDown: [],
    afterCellMouseDown: [],
    beforeCellMouseMove: [],
    afterCellMouseMove: [],
    beforeFillerMouseDown: [],
    afterFillerMouseDown: [],
    beforeFilling: [],
    afterFilling: [],
    beforeSelectionChange: [],
    afterSelectionChange: [],
    beforeContextMenuShow: [],
    afterContextMenuShow: [],
    beforeColumnResizingStart: [],
    afterColumnResizingStart: [],
    beforeColumnResizingEnd: [],
    afterColumnResizingEnd: [],
    beforeRowResizingStart: [],
    afterRowResizingStart: [],
    beforeRowResizingEnd: [],
    afterRowResizingEnd: [],
    beforeKeyDown: [],
    afterKeyDown: [],
    beforeKeyPress: [],
    afterKeyPress: [],
    beforeKeyUp: [],
    afterKeyUp: [],
    beforeCopy: [],
    afterCopy: [],
    beforePaste: [],
    afterPaste: [],
    beforeRowDragStart: [],
    afterRowDragStart: [],
    beforeRowDragEnd: [],
    afterRowDragEnd: [],
    beforeColumnDragStart: [],
    afterColumnDragStart: [],
    beforeColumnDragEnd: [],
    afterColumnDragEnd: [],
}
