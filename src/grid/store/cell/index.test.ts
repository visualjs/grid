import { FillRange } from "@/selection/FillRange";
import Store from ".";
import { useSelector } from "..";

describe('dispatchers for cell', () => {

    test('selectCells', () => {

        const store = new Store();
        const cb = jest.fn();

        useSelector(store, (state) => {
            return {
                selections: state.selections,
            };
        }, cb)

        store.dispatch('selectCells', undefined);
        store.dispatch('selectCells', { start: undefined, end: undefined });
        store.dispatch('selectCells', {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 10 }
        });

        store.dispatch('setEditing', { row: 'r', column: 'c' });

        expect(cb).toBeCalledTimes(3);
    });

    test('setEditing', () => {

        const store = new Store();
        const cb = jest.fn();

        useSelector(store, (state) => {
            return {
                editing: state.editing,
            };
        }, cb)

        store.dispatch('selectCells', { start: undefined, end: undefined });
        store.dispatch('setEditing', undefined);
        store.dispatch('setEditing', { row: 'r', column: 'c' });
        store.dispatch('setEditing', undefined);

        expect(cb).toBeCalledTimes(2);
    });

    test('setFilling', () => {

        const store = new Store();
        const cb = jest.fn();

        useSelector(store, (state) => {
            return {
                filling: state.filling,
            };
        }, cb)

        store.dispatch('setEditing', undefined);
        store.dispatch('setFilling', undefined);
        store.dispatch('setFilling', new FillRange(undefined, undefined));
        store.dispatch('setFilling', undefined);

        expect(cb).toBeCalledTimes(2);
    });
});

describe('actions for cell', () => {

    test('getCoordLocatedRange', () => {
        const store = new Store();
        const cb = jest.fn();

        // # 0 1 2 3 4 5 6
        // 0 o o o o o o o
        // 1 o x x x x o o
        // 2 o x x x x o o 
        // 3 o o o o o o o 
        // 4 o o o o o o o
        store.dispatch('selectCells', {
            start: { x: 1, y: 1 },
            end: { x: 4, y: 2 },
        });

        expect(store.getCoordLocatedRange({x: 0, y: 0})).toBeUndefined();
        expect(store.getCoordLocatedRange({x: 5, y: 1})).toBeUndefined();
        expect(store.getCoordLocatedRange({x: 2, y: 2})).not.toBeUndefined();
        expect(store.getCoordLocatedRange({x: 2, y: 1})).not.toBeUndefined();
    });

});
