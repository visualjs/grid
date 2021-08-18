import { ComponentChild } from "./types";

abstract class Component<P> {

    protected base?: Element | Text;

    protected refs: Record<string, HTMLElement> = {};

    constructor(protected props?: P) {
        //
    }

    // create jsx fragment
    abstract render(): ComponentChild;
}

export default Component;
