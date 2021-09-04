import Root from './Root';
import { MockStore, State as MockState, Actions as MockActions } from './Store.test';

interface State {
    s1: MockState;
    s2: MockState;
}

interface Actions {
    s1: MockActions;
    s2: MockActions;
}

test('root', () => {

    const root = new Root<State, Actions>({
        s1: new MockStore(),
        s2: new MockStore(),
    });

    const cbS1 = jest.fn();
    const cb = jest.fn();

    root.subscribe('s1', cbS1);
    root.subscribeAny(cb);

    root.store('s1').dispatch('updateName', 'Donna');
    root.store('s1').dispatch('updateScore', 20);
    root.store('s2').dispatch('updateName', 'Donna');
    root.store('s2').dispatch('updateScore', 20);

    expect(cbS1).toBeCalledTimes(2);
    expect(cb).toBeCalledTimes(4);
});
