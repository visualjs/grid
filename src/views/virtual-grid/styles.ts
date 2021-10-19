import { JSXInternal } from "preact/src/jsx";

export const STYLE_WRAPPER: JSXInternal.CSSProperties = {
    width: '100%',
    height: '100%',
};

export const STYLE_SCROLL_VERTICAL: JSXInternal.CSSProperties = {
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    height: '100%',
    display: 'flex',
}

export const STYLE_SCROLL_HORIZONTAL: JSXInternal.CSSProperties = {
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    flexGrow: 1,
    minHeight: '100%'
}

export const STYLE_INNER: JSXInternal.CSSProperties = {
    position: 'relative',
    height: '100%',
};

export const STYLE_PINNED_WRAPPER: JSXInternal.CSSProperties = {
    position: 'relative',
    flexShrink: 0,
    boxSizing: 'content-box',
}

export const STYLE_PINNED_ITEM: JSXInternal.CSSProperties = {
    height: '100%',
    width: '100%',
}

export const STYLE_ITEM: JSXInternal.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
};
