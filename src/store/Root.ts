import { Callback, Store } from ".";

type StateOfStore<S extends Store<any, any>> = S extends Store<infer State, any> ? State : never;
type ActionOfStore<S extends Store<any, any>> = S extends Store<any, infer Action> ? Action : never;

type Actions<T> = {
    [P in keyof T]: undefined;
};

type State<S extends { [K in keyof S]: Store<any, any> }> = {
    [K in keyof S]: StateOfStore<S[K]>;
}

type Stores<S extends { [K in keyof S]: Store<any, any> }> = {
    [K in keyof S]: Store<StateOfStore<S[K]>, ActionOfStore<S[K]>>;
};

export class Root<S extends { [K in keyof S]: Store<any, any> }> extends Store<State<S>, Actions<S>> {

    constructor(protected stores: Stores<S>) {

        super(
            Object.keys(stores).reduce((obj, key) => {
                (obj as any)[key] = [];
                return obj;
            }, {} as Record<keyof S, Callback[]>),
            Object.keys(stores).reduce((s, key) => {
                (s as any)[key] = stores[key as keyof S].getState();
                return s;
            }, {} as State<S>)
        );

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

    public store<K extends keyof S>(s: K) {
        return this.stores[s];
    }
}

export default Root;
