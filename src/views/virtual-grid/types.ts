import { ComponentChildren } from "preact";
import { JSXInternal } from "preact/src/jsx";

export type ItemSizeGetter = (index: number) => number;
export type ItemSize = number | Record<string, number> | ((id: string) => number);

export interface SizeAndPosition {
    size: number;
    offset: number;
}

export interface RowInfo {
    row: string;
    cells: ComponentChildren;
    style: JSXInternal.CSSProperties;
}

export interface CellInfo {
    row: string;
    column: string;
    style: JSXInternal.CSSProperties;
}
