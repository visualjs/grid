import { counter, diff } from ".";

describe('utils', () => {
    test('counter', () => {

        var c1 = counter();
        var c2 = counter();

        expect(c1()).toBe(0);
        expect(c1()).toBe(1);
        expect(c1()).toBe(2);

        expect(c2()).toBe(0);
        expect(c2()).toBe(1);
        expect(c2()).toBe(2);
    });

    test('diff', () => {
        expect(diff([1, 2], [2])).toStrictEqual([1]);
        expect(diff([1], [2, 1])).toStrictEqual([]);
        expect(diff([1, 2, 3, 4], [2, 1, 0])).toStrictEqual([3, 4]);
    });

});
