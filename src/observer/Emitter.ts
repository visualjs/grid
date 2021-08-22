import { Events } from './Events';

export class Emitter<EventTypes> {
    public events: { [key: string]: Function[] } = {};

    constructor(events: Events | Emitter<EventTypes>) {
        this.events = events instanceof Emitter ? events.events : events.handlers;
    }

    /**
     * Add event listener function, you can add multiple events at once
     *
     * @param names
     * @param handler
     */
    public addListener<K extends keyof EventTypes>(names: K | K[], handler: (args: EventTypes[K]) => void | unknown): this {
        const events = Array.isArray(names) ? names : (names as string).split(' ');

        (events as string[]).forEach(name => {
            if (!this.events[name]) throw new Error(`The event ${name} does not exist`);
            this.events[name].push(handler);
        });

        return this;
    }

    public removeListener<K extends keyof EventTypes>(names: K | K[], handler: (args: EventTypes[K]) => void | unknown): this {
        
        const events = Array.isArray(names) ? names : (names as string).split(' ');
        (events as string[]).forEach(name => {
            if (!this.events[name]) throw new Error(`The event ${name} does not exist`);
            while(true) {
                const index = this.events[name].findIndex((h) => h == handler);
                if (index == -1) {
                    break;
                }
                this.events[name].splice(index, 1);
            }
        })

        return this;
    }

    /**
     * Trigger event
     *
     * @param name
     * @param params
     */
    public trigger<K extends keyof EventTypes>(name: K, params: EventTypes[K] | {} = this) {
        if (!(name in this.events)) throw new Error(`The event ${name} cannot be triggered`);

        return this.events[name as string].reduce((r: boolean, e: Function) => {
            return e(params) !== false && r;
        }, true); // return false if at least one event is false
    }

    /**
     * Dynamically bind new event types
     *
     * @param name
     */
    public bind(name: string) {
        if (this.events[name]) throw new Error(`The event ${name} is already bound`);

        this.events[name] = [];
    }

    /**
     * Whether there is an event by given name
     *
     * @param name
     */
    public exist(name: string) {
        return Array.isArray(this.events[name]);
    }
}
