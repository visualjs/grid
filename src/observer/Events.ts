export class Events {
    public handlers = {};

    constructor(handlers: {}) {
        this.handlers = {
            warn: [console.warn],
            error: [console.error],
            destroy: [],
            ...handlers
        }
    }
}

export interface EventsTypes {
    warn: string | Error;
    error: string | Error;
    destroy: void;
}
