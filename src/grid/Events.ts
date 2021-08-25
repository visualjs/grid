import { EventsTypes as DefaultEventsTypes, Events } from '@/observer/Events';
import SelectionRange from '@/selection/SelectionRange';

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
            ...handlers
        })
    }
}

export interface EventsTypes extends DefaultEventsTypes {
    selectionChanged: SelectionChangedEvent;
    cellValueChanged: CellValueChangedEvent;
}

