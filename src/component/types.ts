
export type Key = string | number | any;

export interface Attributes {
	key?: Key;
	jsx?: boolean;
}

export interface Component<P> {}

export interface FunctionComponent<P = {}> {
	(props: P): VNode<any> | null;
}

export interface ComponentClass<P = {}> {
    new (props: P): Component<P>;
}

export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

export interface VNode<P = {}> {
	type: ComponentType<P> | string;
	props: P & { children: ComponentChildren };
	key?: any;
	ref?: string;
}

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
