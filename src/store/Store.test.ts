import { Store } from "./Store";

interface Actions {
    updateScore: number;
    updateName: string;
}

interface State {
    name: string;
    score: number;
}

class MockStore extends Store<State, Actions> {
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

    let nameUpdated = 0;
    let scoreUpdated = 0;

    const store = new MockStore();

    const unsubscribeNameChange = store.subscribe('updateName', () => {
        nameUpdated += 1;
    });

    store.subscribe('updateScore', () => {
        scoreUpdated += 1;
    });

    store.dispatch('updateName', 'Donna');
    store.dispatch('updateScore', 99);

    expect(nameUpdated).toBe(1);
    expect(scoreUpdated).toBe(1);

    unsubscribeNameChange();

    store.dispatch('updateName', 'Donna');
    store.dispatch('updateScore', 99);

    expect(nameUpdated).toBe(1);
    expect(scoreUpdated).toBe(2);
});
