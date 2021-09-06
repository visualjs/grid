import { Store } from ".";

export interface Actions {
    updateScore: number;
    updateName: string;
}

export interface State {
    name: string;
    score: number;
}

export class MockStore extends Store<State, Actions> {
    constructor() {
        super({
            updateScore: [],
            updateName: [],
        })

        this.handle('updateName', (state, payload) => {
            return { ...state, name: payload };
        }).handle('updateScore', (state, payload) => {
            return { ...state, score: payload };
        });
    }
}

test('subscribe and unsubscribe', () => {

    const store = new MockStore();
    const scoreUpdated = jest.fn();
    const nameUpdated = jest.fn();

    const unsubscribeNameChange = store.subscribe('updateName', nameUpdated);

    store.subscribe('updateScore', scoreUpdated);

    store.dispatch('updateName', 'Donna');
    store.dispatch('updateScore', 99);

    expect(nameUpdated).toBeCalledTimes(1);
    expect(scoreUpdated).toBeCalledTimes(1);

    expect(store.getState().name).toBe('Donna');
    expect(store.getState().score).toBe(99);

    unsubscribeNameChange();

    store.dispatch('updateName', 'Donna');
    store.dispatch('updateScore', 99);

    expect(nameUpdated).toBeCalledTimes(1);
    expect(scoreUpdated).toBeCalledTimes(2);
});

test('subscribe any change', () => {


    const store = new MockStore();
    const callback = jest.fn();

    store.subscribeAny(callback);

    store.dispatch('updateName', 'Donna');
    store.dispatch('updateScore', 99);

    expect(callback).toBeCalledTimes(2);
});
