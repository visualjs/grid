import { createVNode } from './createElement';
import { setProps } from './props';
import { VNode } from './types';

/**
 * Render a virtual node into a DOM element
 */
export function render(vnode: VNode<any>, parent: Node): any {

    let newType: any = vnode.type;

    // When passing through createElement it assigns the object
    // constructor as undefined. This to prevent JSON-injection.
    if (vnode.constructor !== undefined) {
        return null;
    }

    let dom: HTMLElement | Text | null = null;

    if ('function' == typeof newType) {
        if ('prototype' in newType && newType.prototype.render) {
            return render((new newType(vnode.props)).render(), parent);
        } else {
            return render(newType(vnode.props), parent);
        }

    } else if (newType == null) {
        dom = document.createTextNode(vnode.props);
    } else {
        dom = document.createElement(newType, vnode.props);
    }

    if (dom instanceof HTMLElement) {
        setProps(dom, vnode.props);
    }

    if (dom) {
        const c = vnode.props.children;
        renderChildren(dom, Array.isArray(c) ? c : [c]);
        parent.appendChild(dom);
    }

    return dom;
}

/**
 * Render children to parent DOM element
 */
function renderChildren(parent: Node, children: any[]) {
    
    for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (child == null || typeof child == 'boolean') {
			child = null;
		}
        else if (
			typeof child == 'string' ||
			typeof child == 'number' ||
			typeof child == 'bigint'
		) {
			child = createVNode(null, child as any);
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
