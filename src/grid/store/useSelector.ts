import { shallowEqual } from "@/utils";
import { Store } from ".";

export interface Selector<T> {
    state: T;
    getState: () => T;
    cancel: () => void;
}

export function useSelector<State, SelectState>(
    store: Store<State, any>,
    selector: (state: State, props?: any) => SelectState,
    callback: (state: SelectState) => void,
    props?: any
): Selector<SelectState> {

    const s: Selector<SelectState> = {
        state: selector(store.getState(), props),
        getState: () => s.state,
        cancel: () => {},
    };

    s.cancel = store.subscribeAny(() => {
        const selectState = selector(store.getState(), props);
        if (!shallowEqual(selectState, s.state)) {
            s.state = selectState;
            callback(s.state);
        }
    });

    return s;
}
