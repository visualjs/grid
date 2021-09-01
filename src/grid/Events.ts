import { EventsTypes as DefaultEventsTypes, Events } from '@/observer/Events';
import CellRange from '@/selection/CellRange';
import { FillRange } from '@/selection/FillRange';
import { CellPosition } from '@/types';

export interface CellValueChangedEvent {
    row: string;
    column: string;
    value: any;
    oldValue: any;
}

export type SelectionChangedEvent = CellRange[];

export class GridEvents extends Events {
    constructor(handlers: {} = {}) {
        super({
            columnWidthChanged: [],
            columnOptionsChanged: [],
            selectionChanged: [],
            fillingRangeChanged: [],
            cellValueChanged: [],
            startCellEditing: [],
            stopEditing: [],
            hoveredRowChanged: [],
            selectedRowsChanged: [],
            ...handlers
        })
    }
}

export interface EventsTypes extends DefaultEventsTypes {
    columnWidthChanged: { field: string, width: number };
    columnOptionsChanged: string;
    selectionChanged: SelectionChangedEvent;
    fillingRangeChanged: FillRange,
    cellValueChanged: CellValueChangedEvent;
    startCellEditing: CellPosition;
    stopEditing: void;
    hoveredRowChanged: string | undefined,
    selectedRowsChanged: string[],
}

