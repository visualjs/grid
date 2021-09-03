import Store from ".";

test('append rows', () => {

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

test('hover over a row', () => {
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

test('select rows', () => {
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
