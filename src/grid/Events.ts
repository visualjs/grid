import { EventsTypes as DefaultEventsTypes, Events } from '@/observer/Events';
import SelectionRange from '@/selection/SelectionRange';
import { CellPosition } from '@/types';

export interface CellValueChangedEvent {
    row: string;
    column: string;
    value: any;
    oldValue: any;
}

export type SelectionChangedEvent = SelectionRange[];

export class GridEvents extends Events {
    constructor(handlers: {} = {}) {
        super({
            selectionChanged: [],
            cellValueChanged: [],
            startCellEditing: [],
            stopEditing: [],
            ...handlers
        })
    }
}

export interface EventsTypes extends DefaultEventsTypes {
    selectionChanged: SelectionChangedEvent;
    cellValueChanged: CellValueChangedEvent;
    startCellEditing: CellPosition;
    stopEditing: void;
}

