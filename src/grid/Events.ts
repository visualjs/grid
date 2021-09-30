import { FillRange } from '@/selection/FillRange';
import { CellPosition, Coordinate, MenuItem } from '@/types';
import { Events as EventsType } from './Observer';

export interface EventsDef {
    beforeCellDbClicked: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    afterCellDbClicked: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    beforeCellMouseDown: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    afterCellMouseDown: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    beforeCellMouseMove: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    afterCellMouseMove: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    beforeFillerMouseDown: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    afterFillerMouseDown: (pos: CellPosition, ev: MouseEvent) => boolean | void;
    beforeFilling: (range: FillRange) => boolean | void;
    afterFilling: (range: FillRange) => boolean | void;
    beforeSelectionChange: (start: Coordinate, end: Coordinate) => boolean | void;
    afterSelectionChange: (start: Coordinate, end: Coordinate) => boolean | void;
    beforeContextMenuShow: (pos: CellPosition, items: MenuItem[]) => boolean | void;
    afterContextMenuShow: (pos: CellPosition, items: MenuItem[]) => boolean | void;
    beforeColumnResizing: (column: string, width: number) => boolean | void;
    afterColumnResizing: (column: string, width: number) => boolean | void;
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
    beforeColumnResizing: [],
    afterColumnResizing: [],
}
