import clsx, { ClassValue } from 'clsx';

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
export function scrollSync(elements, cb) {
    let active: any = null;
    elements.forEach(function (element) {
        element.addEventListener('mouseenter', function (e) {
            active = e.target;
        });

        element.addEventListener('scroll', function (e) {
            if (e.target !== active) return;

            elements.forEach(function (target) {
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
