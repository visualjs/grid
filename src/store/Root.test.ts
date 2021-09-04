import Root from './Root';
import Store from './Store';

export interface S1Actions {
    updateName: string;
}

export interface S1State {
    name: string;
}

export class MockStore1 extends Store<S1State, S1Actions> {
    constructor() {
        super({ updateName: [] });
        this.handle('updateName', (state, payload) => {
            return { ...state, name: payload };
        });
    }
}

export interface S2Actions {
    updateScore: number;
}

export interface S2State {
    score: number;
}

export class MockStore2 extends Store<S2State, S2Actions> {
    constructor() {
        super({ updateScore: [] });
        this.handle('updateScore', (state, payload) => {
            return { ...state, score: payload };
        });
    }
}

interface Stores {
    s1: MockStore1;
    s2: MockStore2;
}

test('root', () => {

    const root = new Root<Stores>({
        s1: new MockStore1(),
        s2: new MockStore2(),
    });

    const cbS1 = jest.fn();
    const cb = jest.fn();

    root.subscribe('s1', cbS1);
    root.subscribeAny(cb);

    root.store('s1').dispatch('updateName', 'Donna');
    root.store('s1').dispatch('updateName', 'Anna');
    root.store('s2').dispatch('updateScore', 10);
    root.store('s2').dispatch('updateScore', 20);

    expect(cbS1).toBeCalledTimes(2);
    expect(cb).toBeCalledTimes(4);
});
