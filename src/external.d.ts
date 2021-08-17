declare namespace JSX {
    type Element = HTMLElement;
    interface ElementClass {
        render(): HTMLElement;
    }
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
}
