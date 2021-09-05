import { Store, defaultColumnOptions } from ".";
import { useSelector } from "../useSelector";

test('set columns', () => {

    const store = new Store();

    store.dispatch('setColumns', {
        columns: [
            { field: 'c_01' },
            { field: 'c_02' },
            { field: 'cl_01', pinned: 'left' },
            { field: 'cl_02', pinned: 'left' },
            { field: 'cr_01', pinned: 'right' },
            { field: 'cr_02', pinned: 'right' },
        ],
        defaultOptions: {
            width: 100
        },
    });

    expect(store.getState().pinnedLeftColumns.length).toBe(2);
    expect(store.getState().pinnedRightColumns.length).toBe(2);
    expect(store.getState().normalColumns.length).toBe(2);

    expect(Object.keys(store.getState().columns).length).toBe(6);
    expect(store.getColumnOptions('c_01')).toBeDefined();
    expect(store.getColumnOptions('c_10')).toBeUndefined();

    expect(store.getColumnOptions('c_01').width).toBe(100);
    expect(store.getColumnOptions('c_01').minWidth).toBe(defaultColumnOptions.minWidth);
});

test('update column pinned', () => {

    const store = new Store();

    store.dispatch('setColumns', {
        columns: [
            { field: 'c_01' },
            { field: 'c_02' },
            { field: 'cl_01', pinned: 'left' },
            { field: 'cl_02', pinned: 'left' },
            { field: 'cr_01', pinned: 'right' },
            { field: 'cr_02', pinned: 'right' },
        ]
    });

    const cbs = jest.fn();

    useSelector(store, (s) => {
        return { columns: s.columns }
    }, cbs)

    const cb = jest.fn();
    store.subscribe('updateColumnPinned', cb);

    expect(store.getState().pinnedLeftColumns.length).toBe(2);
    expect(store.getState().pinnedRightColumns.length).toBe(2);
    expect(store.getState().normalColumns.length).toBe(2);

    expect(store.getColumnOptions('c_01').pinned).toBeUndefined();

    store.dispatch('updateColumnPinned', { field: 'c_01', pinned: 'left' });

    expect(store.getState().pinnedLeftColumns.length).toBe(3);
    expect(store.getState().pinnedRightColumns.length).toBe(2);
    expect(store.getState().normalColumns.length).toBe(1);

    expect(store.getColumnOptions('c_01').pinned).toBe('left');

    expect(cb).toBeCalledTimes(1);
    expect(cbs).toBeCalledTimes(1);
});

test('update column width', () => {

    const store = new Store();

    store.dispatch('setColumns', {
        columns: [
            { field: 'c_01' },
            { field: 'c_02' },
            { field: 'cl_01', pinned: 'left' },
            { field: 'cl_02', pinned: 'left' },
            { field: 'cr_01', pinned: 'right' },
            { field: 'cr_02', pinned: 'right' },
        ],
        defaultOptions: { width: 80 }
    });

    const cbs = jest.fn();

    useSelector(store, (s) => {
        return { columns: s.columns }
    }, cbs)

    const cb = jest.fn();
    store.subscribe('updateColumnWidth', cb);

    expect(store.getColumnOptions('c_01').width).toBe(80);
    store.dispatch('updateColumnWidth', { field: 'c_01', width: 120 });
    expect(store.getColumnOptions('c_01').width).toBe(120);

    expect(cb).toBeCalledTimes(1);
    expect(cbs).toBeCalledTimes(1);
});
