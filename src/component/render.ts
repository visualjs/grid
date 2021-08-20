import Component from './Component';
import { createElement, createVNode } from './createElement';
import { setProps } from './props';
import { VNode } from './types';

interface QueueCallback {
    (): void;
}

function renderComponent(c: Component<any>, parent?: Node, commitQueue: QueueCallback[] = []) {
    parent = parent || c._parentDom;
    const vnode = c._vnode;

    if (!parent || !vnode) {
        return;
    }

    c.componentDidMount && commitQueue.push(c.componentDidMount);

    if (vnode._dom) {
        c.componentWillUnmount && c.componentWillUnmount();
        parent.removeChild(vnode._dom);
        c.componentDidUnmount && c.componentDidUnmount();
    }

    const result: any = c.render();
    if ('object' === typeof result && result._vnode === true) {
        vnode._dom = createDOMElement(parent, result, commitQueue);
    }

    if (vnode.ref) {
        vnode.ref(vnode);
    }

    return vnode._dom;
}

function createDOMElement(parent: Node, vnode: VNode<any>, commitQueue: QueueCallback[] = []): Node {

    let newType = vnode.type;

    // When passing through createElement it assigns the object
    // _vnode as true. This to prevent JSON-injection.
    if (vnode._vnode != true) {
        return null;
    }

    if ('function' == typeof newType) {
        return renderComponent(
            createComponent(vnode, parent), parent, commitQueue
        );
    } else if (newType == null) {
        vnode._dom = document.createTextNode(vnode.props);
    } else {
        vnode._dom = document.createElement(newType, vnode.props);
    }

    if (vnode._dom instanceof HTMLElement) {
        setProps(vnode._dom, vnode.props);
    }

    if (vnode._dom) {
        const c = vnode.props.children;
        renderChildren(vnode._dom, Array.isArray(c) ? c : [c], commitQueue);
        parent.appendChild(vnode._dom);

        if (vnode.ref) {
            vnode.ref(vnode);
        }
    }

    return vnode._dom;
}

export function createComponent(vnode: VNode<any>, parent?: Node) {
    if (vnode._component) {
        return vnode._component;
    }

    let newType = vnode.type;

    if ('function' == typeof newType) {
        vnode._component = (new newType(vnode.props));
        vnode._component._vnode = vnode;
        vnode._component._parentDom = parent;
        return vnode._component;
    }
}

/**
 * Render a virtual node or Component into a DOM element
 */
export function render(c: Component<any>, parent?: Node, commitQueue: QueueCallback[] = []): any {
    renderComponent(c, parent, commitQueue);
    commitQueue.some(c => c());
}

/**
 * Render children to parent DOM element
 */
function renderChildren(parent: Node, children: any[], commitQueue: QueueCallback[]) {

    for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (child == null || typeof child == 'boolean') {
            child = null;
        } else if (!Array.isArray(child) && child._vnode != true) {
            child = createVNode(null, child.toString() as any);
        }

        if (child == null || child == undefined) {
            continue;
        }

        if (Array.isArray(child)) {
            for (let n in child) {
                createDOMElement(parent, child[n], commitQueue);
            }
        } else {
            createDOMElement(parent, child, commitQueue);
        }
    }

}
