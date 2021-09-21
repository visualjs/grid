import { FillRange } from "@/selection/FillRange";
import Grid from ".";
import data from './data.mock';

describe('actions for grid', () => {

    test('getCoordinate', () => {

        const grid = new Grid(null, data, () => { });

        expect(grid.getCoordinate('r_02', 'name')).toStrictEqual({ x: 2, y: 1 });
        expect(grid.getCoordinate('r_02', 'status')).toStrictEqual({ x: 1, y: 1 });
        expect(grid.getCoordinate('r_02', 'game')).toStrictEqual({ x: 5, y: 1 });
        expect(grid.getCoordinate('r_02', 'date')).toStrictEqual({ x: 4, y: 1 });
        expect(grid.getCoordinate('r_00', 'date')).toStrictEqual({ x: -1, y: -1 });
        expect(grid.getCoordinate('r_01', 'hello')).toStrictEqual({ x: -1, y: -1 });
    });

    test('getCellValue', () => {

        const grid = new Grid(null, data, () => { });

        // transformed value
        expect(grid.getCellValue('r_01', 'name')).toBe('trans_name_01');
        // without transformer
        expect(grid.getCellValue('r_01', 'status')).toBe('status_01');
        expect(grid.getCellValue('r_01', 'hello')).toBeUndefined();
    });

    test('setCellValue', () => {

        const grid = new Grid(null, data, () => { });

        // transformed value
        expect(grid.getRawCellValue('r_01', 'name')).toBe('name_01');
        grid.setCellValue('r_01', 'name', 'trans_new_name');
        expect(grid.getRawCellValue('r_01', 'name')).toBe('new_name');
        // without transformer
        expect(grid.getRawCellValue('r_01', 'status')).toBe('status_01');
        grid.setCellValue('r_01', 'status', 'new_status');
        expect(grid.getRawCellValue('r_01', 'status')).toBe('new_status');
        // readonly
        expect(grid.getRawCellValue('r_01', 'date')).toBe('date_01');
        grid.setCellValue('r_01', 'date', 'new_date');
        expect(grid.getRawCellValue('r_01', 'date')).toBe('date_01');
    });

    describe('getSelectBoundary', () => {

        const grid = new Grid(null, data, () => { });

        // # 0 1 2 3 4 5 6
        // 0 o o o o o o o
        // 1 o x x x x o o
        // 2 o x x x x o o 
        // 3 o x x x x o o 
        // 4 o o o o o o o
        grid.store('cell').dispatch('selectCells', {
            start: { x: 1, y: 1 },
            end: { x: 4, y: 3 },
        });

        it('should be undefined', () => {
            const cells = [
                grid.getCellPosition({ x: 1, y: 0 }),
                grid.getCellPosition({ x: 5, y: 1 }),
            ];

            cells.forEach(pos => {
                const boundary = grid.getSelectBoundary(pos.row, pos.column);
                expect(boundary).toBeUndefined();
            });
        });

        it('should be center', () => {
            const cells = [
                grid.getCellPosition({ x: 2, y: 2 }),
                grid.getCellPosition({ x: 3, y: 2 }),
            ];

            cells.forEach(pos => {
                const boundary = grid.getSelectBoundary(pos.row, pos.column);
                expect(boundary).not.toBeUndefined();
                expect(boundary.top).toBeFalsy();
                expect(boundary.right).toBeFalsy();
                expect(boundary.bottom).toBeFalsy();
                expect(boundary.left).toBeFalsy();
            });
        });

        it('should be top boundary', () => {
            const cells = [
                grid.getCellPosition({ x: 1, y: 1 }),
                grid.getCellPosition({ x: 2, y: 1 }),
                grid.getCellPosition({ x: 3, y: 1 }),
                grid.getCellPosition({ x: 4, y: 1 }),
            ];

            cells.forEach(pos => {
                const boundary = grid.getSelectBoundary(pos.row, pos.column);

                expect(boundary).not.toBeUndefined();
                expect(boundary.top).toBeTruthy();
            });
        });

        it('should be right boundary', () => {
            const cells = [
                grid.getCellPosition({ x: 4, y: 1 }),
                grid.getCellPosition({ x: 4, y: 2 }),
                grid.getCellPosition({ x: 4, y: 3 }),
            ];

            cells.forEach(pos => {
                const boundary = grid.getSelectBoundary(pos.row, pos.column);

                expect(boundary).not.toBeUndefined();
                expect(boundary.right).toBeTruthy();
            });
        });

        it('should be bottom boundary', () => {
            const cells = [
                grid.getCellPosition({ x: 1, y: 3 }),
                grid.getCellPosition({ x: 2, y: 3 }),
                grid.getCellPosition({ x: 3, y: 3 }),
                grid.getCellPosition({ x: 4, y: 3 }),
            ];

            cells.forEach(pos => {
                const boundary = grid.getSelectBoundary(pos.row, pos.column);

                expect(boundary).not.toBeUndefined();
                expect(boundary.bottom).toBeTruthy();
            });
        });

        it('should be left boundary', () => {
            const cells = [
                grid.getCellPosition({ x: 1, y: 1 }),
                grid.getCellPosition({ x: 1, y: 2 }),
                grid.getCellPosition({ x: 1, y: 3 }),
            ];

            cells.forEach(pos => {
                const boundary = grid.getSelectBoundary(pos.row, pos.column);

                expect(boundary).not.toBeUndefined();
                expect(boundary.left).toBeTruthy();
            });
        });
    });

    describe('getFillingBoundary', () => {

        const mock = () => {
            const grid = new Grid(null, data, () => { });

            grid.store('cell').dispatch('selectCells', {
                start: { x: 1, y: 1 },
                end: { x: 2, y: 2 },
            });

            const range = grid.getCoordLocatedRange({ x: 1, y: 1 });

            return { grid, range };
        };

        describe('limit x', () => {

            const { grid, range } = mock();

            // # 0 1 2 3 4 5 6
            // 0 o o o o o o o
            // 1 o x x = = o o
            // 2 o x x = = o o 
            // 3 o o o o o o o 
            // 4 o o o o ? o o
            grid.store('cell').dispatch('setFilling', new FillRange(range, { x: 4, y: 4 }, 'x'));

            it('should be in range', () => {
                const cells = [
                    grid.getCellPosition({ x: 3, y: 1 }),
                    grid.getCellPosition({ x: 3, y: 2 }),
                    grid.getCellPosition({ x: 4, y: 1 }),
                    grid.getCellPosition({ x: 4, y: 2 }),
                ];

                cells.forEach(pos => {
                    const boundary = grid.getFillingBoundary(pos.row, pos.column);
                    expect(boundary).not.toBeUndefined();
                });
            });

            it('should not be in range', () => {
                const cells = [
                    grid.getCellPosition({ x: 3, y: 3 }),
                    grid.getCellPosition({ x: 3, y: 4 }),
                    grid.getCellPosition({ x: 4, y: 3 }),
                    grid.getCellPosition({ x: 4, y: 4 }),
                ];

                cells.forEach(pos => {
                    const boundary = grid.getFillingBoundary(pos.row, pos.column);
                    expect(boundary).toBeUndefined();
                });
            });
        });

        describe('limit y', () => {

            const { grid, range } = mock();

            // # 0 1 2 3 4 5 6
            // 0 o o o o o o o
            // 1 o x x o o o o
            // 2 o x x o o o o 
            // 3 o = = o o o o 
            // 4 o = = o ? o o
            grid.store('cell').dispatch('setFilling', new FillRange(range, { x: 4, y: 4 }, 'y'));

            it('should be in range', () => {
                const cells = [
                    grid.getCellPosition({ x: 1, y: 3 }),
                    grid.getCellPosition({ x: 2, y: 3 }),
                    grid.getCellPosition({ x: 1, y: 4 }),
                    grid.getCellPosition({ x: 2, y: 4 }),
                ];

                cells.forEach(pos => {
                    const boundary = grid.getFillingBoundary(pos.row, pos.column);
                    expect(boundary).not.toBeUndefined();
                });
            });

            it('should not be in range', () => {
                const cells = [
                    grid.getCellPosition({ x: 3, y: 3 }),
                    grid.getCellPosition({ x: 3, y: 4 }),
                    grid.getCellPosition({ x: 4, y: 3 }),
                    grid.getCellPosition({ x: 4, y: 4 }),
                ];

                cells.forEach(pos => {
                    const boundary = grid.getFillingBoundary(pos.row, pos.column);
                    expect(boundary).toBeUndefined();
                });
            });
        });
    });
});
