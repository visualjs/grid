
// export type Key = string | number | any;

import Component from "./Component";

export interface IntrinsicAttributes {
	ref?: RefCallback<any>;
	key?: any;
}

// export interface ComponentLifecycle {
// 	componentDidMount?(): void;
// 	componentWillUnmount?(): void;
// 	componentDidUnmount?(): void;
// }

// export interface Component<P> extends ComponentLifecycle {
// 	_parentDom?: Node,
// 	_vnode?: VNode<P>;
// 	render(): any;
// }

// export interface ComponentClass<P = {}> {
// 	new(props: P): Component<P>;
// }

export type ComponentType<P = {}> = {
	new(props: P): Component<P>;
}

export type RefCallback<T> = (instance: T | null) => void;

export interface VNode<P = {}> {
	type: ComponentType<P> | string;
	props: P & { children: ComponentChildren };
	key?: any;
	ref?: RefCallback<VNode>;
	_vnode?: boolean;
	_dom?: Node;
	_component?: Component<P>;
}

// export interface VNode<P = {}> {
// 	type: ComponentType<P> | string;
// 	props: P & { children: ComponentChildren };
// 	key?: any;
// 	ref?: RefCallback<any>;
// 	_vnode?: boolean;
// 	_dom?: Node;
// 	_component?: Component<P>;
// }

export type ComponentChild =
	| VNode<any>
	| object
	| string
	| number
	| bigint
	| boolean
	| null
	| undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;
