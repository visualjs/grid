import h from './h';
export * from './helper';

abstract class Component {
    // create jsx fragment
    abstract render(): HTMLElement;
}

export default Component;
export {
    h
}
