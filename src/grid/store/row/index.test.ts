import data from "@/grid/data.mock";
import Store from ".";

describe('dispatchers for row', () => {

    test('setCellValue', () => {
        const store = new Store();
        store.dispatch('appendRows', [
            { id: 'row', name: 'name' },
        ]);

        store.subscribe('setCellValue', (payload, newState, oldState) => {

            const index = store.getRowIndex(payload.row);

            expect(payload).toStrictEqual({ row: 'row', column: 'name', value: 'new name' });
            expect(oldState.rows[index].name).toBe('name');
            expect(newState.rows[index].name).toBe('new name');
        });

        expect(store.getRawCellValue('row', 'name')).toBe('name');
        store.dispatch('setCellValue', { row: 'row', column: 'name', value: 'new name' });
        expect(store.getRawCellValue('row', 'name')).toBe('new name');
    });

    test('appendRows', () => {

        const store = new Store();
        expect(store.getState().rows.length).toBe(0);

        const cb = jest.fn();
        store.subscribeAny(cb);

        store.dispatch('appendRows', [
            { id: 'row_01', value: 'goodbye' },
            { id: 'row_02' },
        ]);

        expect(store.getState().rows.length).toBe(2);
        expect(store.getState().rowIndexes['row_01']).toBe(0);
        expect(store.getState().rowIndexes['row_02']).toBe(1);

        store.dispatch('appendRows', [
            { id: 'row_03' },
            { id: 'row_04' },
        ]);

        expect(store.getState().rows.length).toBe(4);
        expect(store.getState().rowIndexes['row_01']).toBe(0);
        expect(store.getState().rowIndexes['row_02']).toBe(1);
        expect(store.getState().rowIndexes['row_03']).toBe(2);
        expect(store.getState().rowIndexes['row_04']).toBe(3);
        expect(store.getState().rows[0].value).toBe('goodbye');


        store.dispatch('appendRows', [
            { id: 'row_05' },
            { id: 'row_01', value: 'joe' },
        ]);

        expect(store.getState().rows.length).toBe(5);
        expect(store.getState().rowIndexes['row_01']).toBe(0);
        expect(store.getState().rowIndexes['row_05']).toBe(4);
        expect(store.getState().rows[0].value).toBe('joe');

        expect(cb).toBeCalledTimes(3);
    });

    test('setHoveredRow', () => {
        const store = new Store();
        expect(store.getState().rows.length).toBe(0);

        const cb = jest.fn();
        store.subscribe('setHoveredRow', cb);

        store.dispatch('appendRows', [
            { id: 'row_01' },
            { id: 'row_02' },
        ]);

        expect(store.getState().hoveredRow).toBeUndefined();

        store.dispatch('setHoveredRow', 'row_01');
        expect(store.getState().hoveredRow).toBe('row_01');

        store.dispatch('setHoveredRow', 'row_10');
        expect(store.getState().hoveredRow).toBe('row_01');

        store.dispatch('setHoveredRow', undefined);
        expect(store.getState().hoveredRow).toBeUndefined();

        expect(cb).toBeCalledTimes(2);
    });

    test('selectRows', () => {
        const store = new Store();
        expect(store.getState().rows.length).toBe(0);

        const cb = jest.fn();
        store.subscribe('selectRows', cb);

        store.dispatch('appendRows', [
            { id: 'row_01' },
            { id: 'row_02' },
        ]);

        expect(store.getState().selectedRows).toStrictEqual([]);

        store.dispatch('selectRows', ['row_01']);
        expect(store.getState().selectedRows).toStrictEqual(['row_01']);

        store.dispatch('selectRows', ['row_02', 'row_05']);
        expect(store.getState().selectedRows).toStrictEqual(['row_02']);

        store.dispatch('selectRows', []);
        expect(store.getState().selectedRows).toStrictEqual([]);

        expect(cb).toBeCalledTimes(3);
    });

    test('clear', () => {
        const store = new Store();
        expect(store.getState().rows.length).toBe(0);

        const cb = jest.fn();
        store.subscribe('clear', cb);

        store.dispatch('appendRows', [
            { id: 'row_01' },
            { id: 'row_02' },
        ]);

        store.dispatch('selectRows', ['row_01']);
        store.dispatch('setHoveredRow', 'row_01');

        expect(store.getState().hoveredRow).toBeDefined();
        expect(store.getState().selectedRows).not.toStrictEqual([]);
        expect(store.getState().rowIndexes).not.toStrictEqual({});
        expect(store.getState().rows).not.toStrictEqual([]);

        store.dispatch('clear', undefined);

        expect(store.getState().hoveredRow).toBeUndefined();
        expect(store.getState().selectedRows).toStrictEqual([]);
        expect(store.getState().rowIndexes).toStrictEqual({});
        expect(store.getState().rows).toStrictEqual([]);
    });

});

describe('actions for row', () => {

    const store = new Store();
    store.dispatch('appendRows', data.rows);

    describe('getRawCellValue', () => {
        expect(store.getRawCellValue('r_01', 'name')).toBe('name_01');
        expect(store.getRawCellValue('r_02', 'game')).toBe('game_02');

        expect(store.getRawCellValue('r_00', 'name')).toBeUndefined();
        expect(store.getRawCellValue('r_02', 'hello')).toBeUndefined();

        expect(store.getRawCellValue('r_01', '#')).toBe(1);
        expect(store.getRawCellValue('r_02', '#')).toBe(2);
    });

});
