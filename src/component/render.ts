import { createVNode } from './createElement';
import { setProps } from './props';
import { VNode } from './types';

/**
 * Render a virtual node into a DOM element
 */
export function render(vnode: VNode<any>, parent: Node): any {

    let newType: any = vnode.type;

    // When passing through createElement it assigns the object
    // _vnode as true. This to prevent JSON-injection.
    if (vnode._vnode != true) {
        return null;
    }

    if ('function' == typeof newType) {
        if ('prototype' in newType && newType.prototype.render) {
            const c = (new newType(vnode.props));
            return render(c.render(), parent);
        } else {
            return render(newType(vnode.props), parent);
        }
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
        renderChildren(vnode._dom, Array.isArray(c) ? c : [c]);
        parent.appendChild(vnode._dom);

        if (vnode.ref) {
            vnode.ref(vnode._dom);
        }
    }

    return vnode._dom;
}

/**
 * Render children to parent DOM element
 */
function renderChildren(parent: Node, children: any[]) {
    
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
                render(child[n], parent);
            }
        } else {
            render(child, parent);
        }
    }

}
