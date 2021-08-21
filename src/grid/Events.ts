import { EventsTypes as DefaultEventsTypes, Events } from '@/observer/Events';
import { SelectionRange } from '@/types';

export class GridEvents extends Events {
    constructor(handlers: {} = {}) {
        super({
            selectionChanged: [],
            ...handlers
        })
    }
}

export interface EventsTypes extends DefaultEventsTypes {
    selectionChanged: SelectionRange[]
}

