import { CellRenderer, CellRendererParams } from '@/grid/cell';

import styles from '@/components/styles/selection.module.css';

export interface BaseOption {
    fgColor?: string;
    bgColor?: string;
}

export interface Option extends BaseOption {
    name?: string;
}

export interface Props {
    options?: Record<string, Option>;
    defaultOption?: BaseOption;
}

const defaultProps = {
    options: {},
    defaultOption: {
        fgColor: '#333333',
        bgColor: '#eaeaea'
    }
}

export class SelectionRender extends CellRenderer<Props> {

    protected element: HTMLDivElement = document.createElement('div');

    public init(params: CellRendererParams<Props>) {
        const props = Object.assign({}, defaultProps, params.props);
        let html = '';

        if (Array.isArray(params.value)) {
            params.value.forEach(value => {
                let bg = props.defaultOption.bgColor;
                let fg = props.defaultOption.fgColor;

                if (props.options[value]) {
                    bg = props.options[value].bgColor || bg;
                    fg = props.options[value].fgColor || fg;
                    value = props.options[value].name || value;
                }

                html += `<span class="${styles.inlineSelectionOption}" style="background: ${bg}; color: ${fg}">${value}</span>`;
            })
        }

        this.element.className = styles.inlineSelections;
        this.element.innerHTML = html;
    }

    public gui(): HTMLElement {
        return this.element;
    }

}

export default SelectionRender;
