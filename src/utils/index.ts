export * from './enums';
export * from './dom';
export * from './clipboard';
export * from './shallowEqual';
export * from './deepCopy';

export function classes(value: string | string[] | { [key: string]: boolean }) {

    if (Array.isArray(value)) {
        return value.join(' ');
    }

    if ('object' == typeof value) {

        const classNames: string[] = [];
        for (let i in value) {
            if (value[i] === true) {
                classNames.push(i);
            }
        }

        return classNames.join(' ');
    }

    return value;
}

export function counter() {
    var current = 0;
    return function () {
        return current++;
    };
};

export function diff<T>(target: T[], ...others: T[][]): T[] {
    return target.filter((i) => {
        return others.every(arr => {
            return arr.indexOf(i) < 0;
        });
    });
}

export function unique<T>(arr: T[]): T[] {
    return arr.filter((item, index) => {
        // valid row and remove duplicates
        return arr.indexOf(item, 0) === index;
    });
}
