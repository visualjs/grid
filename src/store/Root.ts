import { Callback, Store } from ".";

type Actions<T> = {
    [P in keyof T]: undefined;
};

type Stores<S, A> = {
    [K in keyof S]: K extends keyof A ? Store<S[K], A[K]> : never;
};

class Root<S, A> extends Store<S, Actions<S>> {

    protected stores: Stores<S, A>;

    constructor(stores: Stores<S, A>) {

        const listeners = Object.keys(stores).reduce((obj, key) => {
            (obj as any)[key] = [];
            return obj;
        }, {} as Record<keyof S, Callback[]>);

        const state = Object.keys(stores).reduce((s, key) => {
            (s as any)[key] = stores[key as keyof S].getState();
            return s;
        }, {} as S);

        super(listeners, state);

        this.stores = stores;

        Object.keys(stores).forEach((s) => {

            stores[s as keyof S].subscribeAny(() => {
                this.dispatch(s as keyof S, undefined);
            });

            this.handle(s as keyof S, (state) => {
                (state as any)[s] = stores[s as keyof S].getState();
                return { ...state };
            });

        });
    }

    public store(s: keyof S) {
        return this.stores[s];
    }
}

export default Root;
