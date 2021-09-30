import { Unsubscribe } from "@/types";
import { deepCopy } from "@/utils";
import Grid from ".";

interface AnyActions {
    [key: string]: (grid: Grid, cb: Function) => () => void;
}

export type HandlersOfActions<A extends AnyActions> = {
    [K in keyof A]: Parameters<A[K]>[1];
}

export type AnyEvents<T> = {
    [P in keyof T]: (...args: any) => boolean | void;
}

export type Events<T> = {
    [P in keyof T]: T[P][];
};

export type Handlers<A extends AnyActions, E extends AnyEvents<E>> = HandlersOfActions<A> & E;

export class Observer<E extends AnyEvents<E>, A extends AnyActions> {

    protected events: Events<E>;

    constructor(protected grid: Grid, events: Events<E>, protected actions: A) {
        // Don't dirty the original data,
        // avoid sharing handlers between different instances
        this.events = deepCopy(events);
    }

    public on<
        K extends keyof A | keyof E,
        H extends Handlers<A, E>,
        >(e: K, h: H[K]): Unsubscribe {

        // bind an action.
        if (this.actions[e as any] !== undefined) {
            return this.actions[e as any](this.grid, h);
        }

        // bind an event.
        this.events[e as keyof E].push(h as any);

        return () => {
            this.events[e as keyof E].splice(
                this.events[e as keyof E].indexOf(h as any), 1
            );
        };
    }

    public trigger<K extends keyof E>(e: K, ...args: Parameters<E[K]>): boolean {

        for (let i = 0; i < this.events[e].length; i++) {
            const h = this.events[e][i];
            if (h(...args) === false) {
                return false;
            }
        }

        return true;
    }
}

export default Observer;
