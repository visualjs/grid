export * from './enums';
export * from './dom';

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

export function isObjectEqual(l: any, r: any) {

    let lProps = Object.getOwnPropertyNames(l);
    let rProps = Object.getOwnPropertyNames(r);

    if (lProps.length != rProps.length) {
        return false;
    }

    for (let i = 0; i < lProps.length; i++) {
        let propA = l[lProps[i]]
        let propB = r[lProps[i]]

        if ((typeof propA === 'object')) {
            return this.isObjectEqual(propA, propB);
        }

        if (propA !== propB) {
            return false
        }
    }

    return true
}
