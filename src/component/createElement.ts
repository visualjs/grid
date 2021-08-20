import { ComponentType } from ".";
import { ComponentChildren, RefCallback, VNode } from "./types";

/**
 * Create an virtual node
 */
export function createVNode(
    type: string | ComponentType,
    props: Record<string, any>,
    key?: any,
    ref?: RefCallback<any>): VNode<any> {
    const vnode = {
        type,
        props,
        key,
        ref,
        _vnode: true,
    };

    return vnode;
}

/**
 * Create an virtual node for JSX
 */
export function createElement<P>(
    type: string | ComponentType<P>,
    props: Record<string, any>,
    ...children: ComponentChildren[]) {
    let normalizedProps: Record<string, any> = {}, key, ref, i;

    for (i in props) {
        if (i == 'key') {
            key = props[i]
        } else if (i == 'ref') {
            ref = props[i]
        } else {
            normalizedProps[i] = props[i]
        }
    }

    if (arguments.length > 2) {
        normalizedProps.children = arguments.length > 3 ? [].slice.call(arguments, 2) : children;
    }

    return createVNode(type, normalizedProps, key, ref);
}
