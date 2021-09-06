import { MockStore, State } from './Store.test';
import { useSelector } from './useSelector';

test('use selector', () => {

    const store = new MockStore();
    const cb = jest.fn();

    const selector = useSelector<State, { name: string }>(store, (state) => {
        return { name: state.name };
    }, cb);

    store.dispatch('updateScore', 10);
    expect(cb).toBeCalledTimes(0);

    store.dispatch('updateName', 'Donna');
    expect(cb).toBeCalledTimes(1);
    expect(selector.getState().name).toBe('Donna');

    store.dispatch('updateName', 'Donna');
    expect(cb).toBeCalledTimes(1);

    store.dispatch('updateName', 'Anna');
    expect(cb).toBeCalledTimes(2);
    expect(selector.getState().name).toBe('Anna');

    selector.cancel();

    store.dispatch('updateName', 'Donna');
    expect(cb).toBeCalledTimes(2);
    expect(selector.getState().name).toBe('Anna');
});
