import data from "@/grid/data.mock";
import Store from ".";
import { useSelector } from "..";

describe('dispatchers for row', () => {

    test('setCellValue', () => {
        const store = new Store();
        store.appendRows([
            { id: 'row', name: 'name' },
        ]);

        store.subscribe('setCellValue', (payload, newState, oldState) => {

            const index = newState.rowIndexes[payload.row];

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
        expect(store.getRowIds().length).toBe(0);

        const cb = jest.fn();
        store.subscribeAny(cb);

        store.appendRows([
            { id: 'row_01', value: 'goodbye' },
            { id: 'row_02' },
        ]);

        expect(store.getRowIds().length).toBe(2);
        expect(store.getRowIndex('row_01')).toBe(0);
        expect(store.getRowIndex('row_02')).toBe(1);

        store.appendRows([
            { id: 'row_03' },
            { id: 'row_04' },
        ]);

        expect(store.getRowIds().length).toBe(4);
        expect(store.getRowIndex('row_01')).toBe(0);
        expect(store.getRowIndex('row_02')).toBe(1);
        expect(store.getRowIndex('row_03')).toBe(2);
        expect(store.getRowIndex('row_04')).toBe(3);
        expect(store.getRowDataByIndex(0).value).toBe('goodbye');

        store.appendRows([
            { id: 'row_05' },
            { id: 'row_01', value: 'joe' },
        ]);

        expect(store.getRowIds().length).toBe(5);
        expect(store.getRowIndex('row_01')).toBe(0);
        expect(store.getRowIndex('row_05')).toBe(4);
        expect(store.getRowDataByIndex(0).value).toBe('joe');

        expect(cb).toBeCalledTimes(3);
    });

    test('appendRowsBefore', () => {
        const store = new Store();
        expect(store.getRowIds().length).toBe(0);

        const cb = jest.fn();
        store.subscribeAny(cb);

        store.dispatch('appendRowsBefore', {
            index: 10, rows: [
                { id: '01', value: 'goodbye' },
                { id: '02' },
            ]
        });

        store.dispatch('appendRowsBefore', {
            index: 1, rows: [
                { id: '03' },
                { id: '04' },
            ]
        });

        expect(store.getRowIds().length).toBe(4);
        expect(store.getRowIndex('01')).toBe(0);
        expect(store.getRowIndex('03')).toBe(1);
        expect(store.getRowIndex('04')).toBe(2);
        expect(store.getRowIndex('02')).toBe(3);
        expect(store.getRowDataByIndex(0).value).toBe('goodbye');

        expect(store.getRowIds()).toStrictEqual([
            '01', '03', '04', '02'
        ]);

        store.dispatch('appendRowsBefore', {
            index: -1, rows: [
                { id: '05' },
                { id: '01', value: 'joe' },
            ]
        });

        expect(store.getRowIds().length).toBe(5);
        expect(store.getRowIndex('05')).toBe(0);
        expect(store.getRowIndex('01')).toBe(1);
        expect(store.getRowIndex('03')).toBe(2);
        expect(store.getRowIndex('04')).toBe(3);
        expect(store.getRowIndex('02')).toBe(4);
        expect(store.getRowDataByIndex(1).value).toBe('joe');

        expect(store.getRowIds()).toStrictEqual([
            '05', '01', '03', '04', '02'
        ]);

        expect(cb).toBeCalledTimes(3);
    });

    test('take rows', () => {
        const store = new Store();
        expect(store.getRowIds().length).toBe(0);

        const rowsChanged = jest.fn();
        const rowIndexesChanged = jest.fn();

        useSelector(store, (state) => {
            return { rows: state.rows };
        }, rowsChanged);

        useSelector(store, (state) => {
            return { indexes: state.normalRows };
        }, rowIndexesChanged);

        store.appendRows([
            { id: 'row_01' },
            { id: 'row_02' },
            { id: 'row_03' },
            { id: 'row_04' },
        ]);

        expect(store.getRowIds().length).toBe(4);
        expect(store.getRowIndex('row_01')).toBe(0);
        expect(store.getRowIndex('row_02')).toBe(1);
        expect(store.getRowIndex('row_03')).toBe(2);
        expect(store.getRowIndex('row_04')).toBe(3);

        store.dispatch('takeRows', ['row_02', 'row_04', 'row_05']);

        expect(store.getRowIds().length).toBe(2);
        expect(store.getRowIndex('row_01')).toBe(0);
        expect(store.getRowIndex('row_02')).toBe(-1);
        expect(store.getRowIndex('row_03')).toBe(1);
        expect(store.getRowIndex('row_04')).toBe(-1);

        expect(rowsChanged).toBeCalledTimes(2);
        expect(rowIndexesChanged).toBeCalledTimes(2);
    });

    test('setHoveredRow', () => {
        const store = new Store();
        expect(store.getRowIds().length).toBe(0);

        const cb = jest.fn();
        store.subscribe('setHoveredRow', cb);

        store.appendRows([
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
        expect(store.getRowIds().length).toBe(0);

        const cb = jest.fn();
        store.subscribe('selectRows', cb);

        store.appendRows([
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

    test('set/takePinnedRows', () => {
        const store = new Store();
        expect(store.getRowIds().length).toBe(0);

        store.appendRows([
            { id: '01' },
            { id: '02' },
            { id: '03' },
            { id: '04' },
            { id: '05' },
            { id: '06' },
        ]);

        const cb = jest.fn();
        useSelector(store, (state) => {
            return {
                t: state.pinnedTopRows,
                b: state.pinnedBottomRows,
                n: state.normalRows,
            };
        }, cb);

        expect(store.getRowIds().length).toBe(6);
        expect(store.getPinnedTopRows().length).toBe(0);
        expect(store.getPinnedBottomRows().length).toBe(0);

        store.dispatch('setPinnedTopRows', ['01', '01', '02', '00']);
        expect(store.getRowIds()).toStrictEqual(['03', '04', '05', '06']);
        expect(store.getPinnedTopRows()).toStrictEqual(['01', '02']);
        expect(store.getPinnedBottomRows()).toStrictEqual([]);

        store.dispatch('setPinnedBottomRows', ['01', '03', '03', '00']);
        expect(store.getRowIds()).toStrictEqual(['04', '05', '06']);
        expect(store.getPinnedTopRows()).toStrictEqual(['02']);
        expect(store.getPinnedBottomRows()).toStrictEqual(['01', '03']);

        store.dispatch('takePinnedRows', ['01', '02']);
        expect(store.getRowIds()).toStrictEqual(['01', '02', '04', '05', '06']);
        expect(store.getPinnedTopRows()).toStrictEqual([]);
        expect(store.getPinnedBottomRows()).toStrictEqual(['03']);

        expect(cb).toBeCalledTimes(3);
    });

    test('clear', () => {
        const store = new Store();
        expect(store.getRowIds().length).toBe(0);

        const cb = jest.fn();
        store.subscribe('clear', cb);

        store.appendRows([
            { id: 'row_01' },
            { id: 'row_02' },
        ]);

        store.dispatch('selectRows', ['row_01']);
        store.dispatch('setHoveredRow', 'row_01');

        expect(store.getState().hoveredRow).toBeDefined();
        expect(store.getState().selectedRows).not.toStrictEqual([]);
        expect(store.getState().normalRows).not.toStrictEqual([]);
        expect(store.getState().rows).not.toStrictEqual({});

        store.dispatch('clear', undefined);

        expect(store.getState().hoveredRow).toBeUndefined();
        expect(store.getState().selectedRows).toStrictEqual([]);
        expect(store.getState().normalRows).toStrictEqual([]);
        expect(store.getState().rows).toStrictEqual({});
    });

});

describe('actions for row', () => {

    test('getRawCellValue', () => {

        const store = new Store();
        store.appendRows(data.rows);

        expect(store.getRawCellValue('r_01', 'name')).toBe('name_01');
        expect(store.getRawCellValue('r_02', 'game')).toBe('game_02');

        expect(store.getRawCellValue('r_00', 'name')).toBeUndefined();
        expect(store.getRawCellValue('r_02', 'hello')).toBeUndefined();

        expect(store.getRawCellValue('r_01', '#')).toBe(1);
        expect(store.getRawCellValue('r_02', '#')).toBe(2);
    });

    test('appendSelectedRows', () => {

        const store = new Store();
        store.appendRows(data.rows);

        const cb = jest.fn();
        store.subscribe('selectRows', cb);

        store.appendSelectedRows(['r_01', 'r_02']);
        expect(store.getState().selectedRows).toStrictEqual(['r_01', 'r_02']);

        store.appendSelectedRows(['r_02', 'r_03']);
        expect(store.getState().selectedRows).toStrictEqual(['r_01', 'r_02', 'r_03']);

        store.appendSelectedRows(['r_04', 'r_00']);
        expect(store.getState().selectedRows).toStrictEqual(['r_01', 'r_02', 'r_03', 'r_04']);

        expect(cb).toBeCalledTimes(3);
    });

    test('takeSelectedRow', () => {

        const store = new Store();
        store.appendRows(data.rows);

        store.appendSelectedRows(['r_01', 'r_02', 'r_03']);
        expect(store.getState().selectedRows).toStrictEqual(['r_01', 'r_02', 'r_03']);

        const cb = jest.fn();
        store.subscribe('selectRows', cb);

        store.takeSelectedRow('r_04');
        expect(store.getState().selectedRows).toStrictEqual(['r_01', 'r_02', 'r_03']);

        store.takeSelectedRow('r_02');
        expect(store.getState().selectedRows).toStrictEqual(['r_01', 'r_03']);

        expect(cb).toBeCalledTimes(1);
    });
});
