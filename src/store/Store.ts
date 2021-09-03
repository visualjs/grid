
export type Callback = () => void;

export class Store<S, A> {

    protected state: S;

    protected actions: Record<keyof A, (state: S, payload: A[keyof A]) => S | undefined> = {} as any;

    constructor(
        protected listeners: Record<keyof A, Callback[]>,
        initialState?: S
    ) {
        this.state = initialState;
    }

    public getState(): S {
        return this.state;
    }

    public subscribe(actions: keyof A | (keyof A)[], listener: Callback): Callback {
        if (!Array.isArray(actions)) {
            actions = [actions];
        }

        const unsubscribes: Function[] = [];

        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];

            this.listeners[action].push(listener);
            unsubscribes.push(() => {
                this.listeners[action].splice(
                    this.listeners[action].indexOf(listener), 1
                );
            });
        }

        return () => unsubscribes.forEach(u => u());
    }

    protected handle<K extends keyof A>(action: K, handler: (s: S, p: A[K]) => S): this {
        this.actions[action] = handler;
        return this;
    }

    public dispatch<K extends keyof A>(action: K, payload: A[K]) {
        const handler = this.actions[action];
        if (!handler) return;

        const state = handler(this.state, payload);
        if (state !== this.state) {
            this.state = state;
            this.listeners[action].forEach(listener => listener());
        }
    }
}
