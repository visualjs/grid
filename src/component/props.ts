
// taken from: https://github.com/preactjs/preact
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

function setStyle(style: CSSStyleDeclaration, key: any, value: any) {
    if (key[0] === '-') {
		style.setProperty(key, value);
	} else if (value == null) {
		style[key] = '';
	} else if (typeof value != 'number' || IS_NON_DIMENSIONAL.test(key)) {
		style[key] = value;
	} else {
		style[key] = value + 'px';
	}
}

/**
 * Apply the props to DOM node
 */
export function setProps(dom: HTMLElement, props: Record<string, any>) {
    for (let i in props) {
        if (
			i !== 'children' &&
			i !== 'key' &&
			i !== 'value' &&
			i !== 'checked'
		) {
            setProperty(dom, i, props[i]);
		}
    }
}

/**
 * Set a property value on a DOM node 
 */
export function setProperty(dom: HTMLElement, name: string, value: any) {

    if (name == 'className') {
        name = 'class';
    }

    if (name == 'style') {
        if ('string' == typeof value) {
            dom.style.cssText = value;
            return;
        }

        for (name in value) {
            setStyle(dom.style, name, value[name]);
        }
    }
    // TODO: events binding
    else if (name[0] === 'o' && name[1] === 'n') {
        // 
    }
    // normal props
    else if (name !== 'dangerouslySetInnerHTML') {
        if (typeof value === 'function') {
			// never serialize functions as attribute values
            return;
		}

        if (name == 'class' && 'object' == typeof value) {
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

        if (
			value != null &&
			(value !== false || (name[0] === 'a' && name[1] === 'r'))
		) {
			dom.setAttribute(name, value);
		} else {
			dom.removeAttribute(name);
		}
    }

}
