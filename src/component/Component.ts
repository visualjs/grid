import { render } from "./render";
import { ComponentChild, IntrinsicAttributes, VNode } from "./types";

abstract class Component<P> {

    public _parentDom?: Node;

    public _vnode?: VNode<P>;

    protected base?: Element | Text;

    protected instances: Record<string, Component<any>> = {};

    protected refs: Record<string, HTMLElement> = {};

    protected listRefs: Record<string, HTMLElement[]> = {};

    constructor(protected props?: P & IntrinsicAttributes) {
        // 
    }

    protected createRef(name: string) {
        return (e: VNode<any>) => {
            if (name.endsWith('[]')) {
                name = name.replace('[]', '');
                if (!this.listRefs[name]) {
                    this.listRefs[name] = [];
                }

                this.listRefs[name].push(e._dom as HTMLElement);
            } else {
                this.refs[name] = e._dom as HTMLElement;
                this.instances[name] = e._component;
            }
        }
    }

    public update = () => {
        this.refs = {};
        this.listRefs = {};

        render(this);
    }

    // create jsx fragment
    abstract render(): ComponentChild;

    /**
     * Called immediately after a component is mounted.
     */
    public componentDidMount?(): void;

    /**
     * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
     * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
     */
    public componentWillUnmount?(): void;

    /**
     * Called immediately after a component is destroyed.
     */
     public componentDidUnmount?(): void;
}

export default Component;
