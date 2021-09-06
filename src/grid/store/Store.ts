
export type Listener<P, S> = (payload?: P, newState?: S, oldState?: S) => void;

export class Store<S, A> {

    protected _state: S;

    protected _actions: Record<keyof A, (state: S, payload: A[keyof A]) => S | undefined> = {} as any;

    protected _anyListeners: Listener<unknown, S>[] = [];

    constructor(
        protected _listeners: Record<keyof A, Listener<unknown, S>[]>,
        initialState?: S
    ) {
        this._state = initialState || {} as S;
    }

    public getState(): S {
        return this._state;
    }

    public subscribeAny(listener: Listener<unknown, S>): (() => void) {
        this._anyListeners.push(listener);

        return () => {
            this._anyListeners.splice(
                this._anyListeners.indexOf(listener), 1
            );
        };
    }

    public subscribe<K extends keyof A>(action: K, listener: Listener<A[K], S>): (() => void) {
        this._listeners[action].push(listener);
        return () => {
            this._listeners[action].splice(
                this._listeners[action].indexOf(listener), 1
            );
        };
    }

    protected handle<K extends keyof A>(action: K, handler: (s: S, p: A[K]) => S): this {
        this._actions[action] = handler;
        return this;
    }

    public dispatch<K extends keyof A>(action: K, payload: A[K]) {
        const handler = this._actions[action];
        if (!handler) return;

        const newState = handler(this._state, payload);
        if (newState !== this._state) {
            const oldState = this._state;
            this._state = newState;
            this._listeners[action].forEach(listener => listener(payload, newState, oldState));
            this._anyListeners.forEach(listener => listener(payload, newState, oldState));
        }
    }
}

export default Store;
