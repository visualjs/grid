import { CellRenderer, CellRendererParams } from '@/grid/cell';

import styles from './styles/checkbox.module.css';

interface Props {
    backgroundColor?: string;
}

export class CheckboxRender extends CellRenderer<Props> {

    protected element: HTMLDivElement = document.createElement('div');

    public init(params: CellRendererParams<Props>) {

        const props = Object.assign({backgroundColor: '#2196f3'}, params.props);

        this.element.className = styles.inlineCheckbox;

        if (Boolean(params.value)) {
            this.element.innerHTML = '<span class="vg-checkmark"></span>';
            this.element.style.backgroundColor = props.backgroundColor;
            this.element.style.borderColor = props.backgroundColor;
        }
    }

    public gui(): HTMLElement {
        return this.element;
    }

}

export default CheckboxRender;
