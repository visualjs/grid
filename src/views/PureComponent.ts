import { createRef, RefObject } from "preact";
import { PureComponent as PreactComponent } from "preact/compat";

export abstract class PureComponent<P = {}, S = {}> extends PreactComponent<P, S> {

    protected refs: Record<string, RefObject<HTMLElement>> = {};

    protected createRef<T extends HTMLElement>(name: string) {
        const ref = createRef<T>();
        this.refs[name] = ref;
        return ref;
    }
}

export default PureComponent;
