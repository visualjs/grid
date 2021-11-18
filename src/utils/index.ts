import clsx, { ClassValue } from 'clsx';
import { Coordinate } from '@/types';

export * from './enums';
export * from './dom';
export * from './clipboard';
export * from './shallowEqual';
export * from './deepCopy';

export function classes(...classes: ClassValue[]) {
    return clsx(...classes);
}

export function counter() {
    var current = 0;
    return function () {
        return current++;
    };
}

export function diff<T>(target: T[], ...others: T[][]): T[] {
    return target.filter((i) => {
        return others.every((arr) => {
            return arr.indexOf(i) < 0;
        });
    });
}

export function intersect<T>(target: T[], ...others: T[][]): T[] {
    return target.filter((i) => {
        return others.every((arr) => {
            return arr.indexOf(i) !== -1;
        });
    });
}

export function unique<T>(arr: T[]): T[] {
    return arr.filter((item, index) => {
        // valid row and remove duplicates
        return arr.indexOf(item, 0) === index;
    });
}

//  https://stackoverflow.com/a/63864273
export function scrollSync(elements: Element[], cb: Function) {
    let active: any = null;
    elements.forEach(function (element: Element) {
        element.addEventListener('mouseenter', function (e: UIEvent) {
            active = e.target;
        });

        element.addEventListener('scroll', function (e: UIEvent) {
            if (e.target !== active) return;

            elements.forEach(function (target: Element) {
                if (active === target) {
                    cb(e);
                    return;
                }

                target.scrollTop = active.scrollTop;
                target.scrollLeft = active.scrollLeft;
            });
        });
    });
}

/**
 * transform coords to two dimensional array
 * @param coords
 */
export function coordsTo2dArray<T>(coords: Array<Coordinate & T>): (T & any)[][] {
    const maxPosition = coords.reduce(
        (reduceData, { x, y }) => {
            reduceData.max_x = Math.max(reduceData.max_x, x);
            reduceData.min_x = Math.min(reduceData.min_x, x);
            reduceData.max_y = Math.max(reduceData.max_y, y);
            reduceData.min_y = Math.min(reduceData.min_y, y);
            return reduceData;
        },
        { max_x: 0, max_y: 0, min_x: 99999, min_y: 99999 }
    );

    const _x = maxPosition.max_x - maxPosition.min_x;
    const _y = maxPosition.max_y - maxPosition.min_y;

    const output = new Array(_y + 1).fill('').map((empty, y) => {
        return new Array(_x + 1).fill('').map((_empty, x) => {
            const current_x = x + maxPosition.min_x;
            const current_y = y + maxPosition.min_y;
            const target = coords.find((item) => {
                return item.x === current_x && item.y === current_y ? item : false;
            });

            return target ?? { x: current_x, y: current_y };
        });
    });

    return output;
}
