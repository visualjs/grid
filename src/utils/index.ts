import clsx, { ClassValue } from 'clsx';

export * from './enums';
export * from './dom';
export * from './browser';
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
};

export function diff<T>(target: T[], ...others: T[][]): T[] {
    return target.filter((i) => {
        return others.every(arr => {
            return arr.indexOf(i) < 0;
        });
    });
}

export function intersect<T>(target: T[], ...others: T[][]): T[] {
    return target.filter((i) => {
        return others.every(arr => {
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

export function arrayMoveMutable<T>(array: T[], fromIndex: number, toIndex: number) {
	const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

	if (startIndex >= 0 && startIndex < array.length) {
		const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

		const [item] = array.splice(fromIndex, 1);
		array.splice(endIndex, 0, item);
	}
}

export function arrayMoveImmutable<T>(array: T[], fromIndex: number, toIndex: number): T[] {
	array = [...array];
	arrayMoveMutable(array, fromIndex, toIndex);
	return array;
}
