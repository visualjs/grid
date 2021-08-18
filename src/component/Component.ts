import { ComponentChild, IntrinsicAttributes } from "./types";

abstract class Component<P> {

    protected base?: Element | Text;

    protected refs: Record<string, HTMLElement> = {};

    protected listRefs: Record<string, HTMLElement[]> = {};

    constructor(protected props?: P & IntrinsicAttributes) {
        // 
    }

    protected createRef(name: string) {
        return (e: HTMLElement) => {
            if (name.endsWith('[]')) {
                name = name.replace('[]', '');
                if (!this.listRefs[name]) {
                    this.listRefs[name] = [];
                }

                this.listRefs[name].push(e);
            } else {
                this.refs[name] = e;
            }
        }
    }

    // create jsx fragment
    abstract render(): ComponentChild;
}

export default Component;
