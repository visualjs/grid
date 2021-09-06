import { Component as PreactComponent, createRef, RefObject } from "preact";

export abstract class Component<P = {}, S = {}> extends PreactComponent<P, S> {

    protected refs: Record<string, RefObject<HTMLElement>> = {};

    protected createRef<T extends HTMLElement>(name: string) {
        const ref = createRef<T>();
        this.refs[name] = ref;
        return ref;
    }
}

export default Component;
