import Component from ".";

const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

export function render(node: any, container: HTMLElement) {
    if (Array.isArray(node)) {
        node.forEach(child => {
            render(child, container);
        });
    } else if (typeof node == 'string' || Boolean(node.nodeType) == false) {
        container.appendChild(document.createTextNode(node.toString()));
    } else {
        container.appendChild(node);
    }
}

// custom jsx factory
export default function createElement(type: any, props: { [id: string]: any }, ...children: any[]) {

    if (typeof type == "function") {
        // class component type
        if (Object.getPrototypeOf(type) === Component) {
            return (new type(props, children)).render();
        }

        // function component type
        return type(props, children);
    }

    let element = document.createElement(type);

    for (let name in props) {
        if (name && props.hasOwnProperty(name)) {
            let value = props[name];
            // rename 'className' property to 'class'
            if ('className' === name) {
                name = 'class';
                if ('object' == typeof value) {
                    const classNames: string[] = [];
                    for (let i in value) {
                        if (value[i] === true) {
                            classNames.push(i);
                        } else if ('string' == typeof value[i]) {
                            classNames.push(value[i]);
                        }
                    }
                    value = classNames.join(' ');
                }
            };

            // convert object type style value
            if ('style' === name && value && 'object' == typeof value) {
                for (let i in value) {
                    element.style[i] = ('number' == typeof value[i]) && !1 === IS_NON_DIMENSIONAL.test(i)
                        ? value[i] + 'px'
                        : value[i];
                }
            } else {
                if (value === true) {
                    element.setAttribute(name, name);
                } else if (value !== false && value != null) {
                    element.setAttribute(name, value.toString());
                }
            }
        }
    }

    for (let child of children) {
        render(child, element);
    }

    return element;
};