// from https://github.com/ag-grid/ag-grid/blob/latest/community-modules/core/src/ts/utils/browser.ts

/**
 * These variables are lazy loaded, as otherwise they try and get initialised when we are loading
 * unit tests and we don't have references to window or document in the unit tests
 * from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
 */
let isSafari: boolean;
let isIE: boolean;
let isEdge: boolean;
let isChrome: boolean;
let isFirefox: boolean;
let isIOS: boolean;
let invisibleScrollbar: boolean;
let browserScrollbarWidth: number;

export function isBrowserIE(): boolean {
    if (isIE === undefined) {
        isIE = /*@cc_on!@*/false || !!(document as any).documentMode; // At least IE6
    }

    return isIE;
}

export function isBrowserEdge(): boolean {
    if (isEdge === undefined) {
        isEdge = !isBrowserIE() && !!(window as any).StyleMedia;
    }

    return isEdge;
}

export function isBrowserSafari(): boolean {
    if (isSafari === undefined) {
        // taken from https://stackoverflow.com/a/23522755/1388233
        isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    return isSafari;
}

export function isBrowserChrome(): boolean {
    if (isChrome === undefined) {
        const win = window as any;
        isChrome = (!!win.chrome && (!!win.chrome.webstore || !!win.chrome.runtime)) ||
            (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));
    }

    return isChrome;
}

export function isBrowserFirefox(): boolean {
    if (isFirefox === undefined) {
        const win = window as any;

        isFirefox = typeof win.InstallTrigger !== 'undefined';
    }

    return isFirefox;
}

export function isIOSUserAgent(): boolean {
    if (isIOS === undefined) {
        // taken from https://stackoverflow.com/a/58064481/1388233
        isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
            // eslint-disable-next-line
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
            // @ts-ignore
            !window.MSStream;
    }

    return isIOS;
}

export function getTabIndex(el: HTMLElement | null): string | null {
    if (!el) { return null; }

    const numberTabIndex = el.tabIndex;
    const tabIndex = el.getAttribute('tabIndex');

    if (isBrowserIE() && numberTabIndex === 0 && tabIndex === null) {
        const map: { [key: string]: boolean; } = {
            a: true,
            body: true,
            button: true,
            frame: true,
            iframe: true,
            img: true,
            input: true,
            isindex: true,
            object: true,
            select: true,
            textarea: true
        };

        return map[el.nodeName.toLowerCase()] === true ? '0' : null;
    }

    if (numberTabIndex === -1 && (tabIndex === null || (tabIndex === '' && !isBrowserFirefox()))) {
        return null;
    }

    return numberTabIndex.toString();
}

function initScrollbarWidthAndVisibility(): void {

    const body = document.body;
    const div = document.createElement('div');

    div.style.width = div.style.height = '100px';
    div.style.opacity = '0';
    div.style.overflow = 'scroll';
    (div.style as any).msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    div.style.position = 'absolute';

    body.appendChild(div);

    let width: number | null = div.offsetWidth - div.clientWidth;

    // if width is 0 and client width is 0, means the DOM isn't ready
    if (width === 0 && div.clientWidth === 0) { width = null; }

    // remove div
    if (div.parentNode) {
        div.parentNode.removeChild(div);
    }

    if (width != null) {
        browserScrollbarWidth = width;
        invisibleScrollbar = width === 0;
    }
}

export function getScrollbarWidth(): number | null {
    if (browserScrollbarWidth == null) {
        initScrollbarWidthAndVisibility();
    }
    return browserScrollbarWidth;
}

export function isInvisibleScrollbar(): boolean {
    if (invisibleScrollbar == null) {
        initScrollbarWidthAndVisibility();
    }
    return invisibleScrollbar;
}
