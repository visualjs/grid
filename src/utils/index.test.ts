import { counter } from ".";

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
});