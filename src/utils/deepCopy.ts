// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
