import { classes } from ".";

export namespace DOM {

    // clear all child elements
    export function clean(e: HTMLElement) {
        e.innerHTML = '';
    }

    export function appendClassName(e: HTMLElement, name: string) {
        const classNames = e.className.split(' ');
        if (classNames.findIndex(n => n === name) !== -1) {
            return;
        }

        classNames.push(name);
        e.className = classNames.join(' ');
    }

    export function removeClassName(e: HTMLElement,name: string) {
        const classNames = e.className.split(' ');
        const index = classNames.findIndex(n => n === name);
        if (index === -1) {
            return;
        }

        classNames.splice(index, 1);
        e.className = classNames.join(' ');
    }

    export function setClassNames(e: HTMLElement, value: string | string[] | { [key: string]: boolean }) {
        e.className = classes(value);
    }

    export function isInViewport(el: HTMLElement) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
            (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}
