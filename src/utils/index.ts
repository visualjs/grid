export * from './enums';
export * from './dom';
export * from './clipboard';
export * from './shallowEqual';

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
