import { CellRenderer, CellRendererParams } from '@/grid/cell';

import styles from '@/components/styles/checkbox.module.css';

export class CheckboxRender extends CellRenderer<{}> {
    protected element: HTMLDivElement = document.createElement('div');

    public init(params: CellRendererParams<{}>) {
        this.element.className = styles.inlineCheckbox;

        if (Boolean(params.value)) {
            this.element.innerHTML = '<span class="vg-checkmark"></span>';
            this.element.className += ' ' + styles.inlineCheckboxChecked;
        }
    }

    public readOnlySelectedGui({ value }: CellRendererParams<{}>): HTMLElement {
        const el = document.createElement('div');
        el.innerHTML = value;
        return el;
    }

    public gui(): HTMLElement {
        return this.element;
    }
}

export default CheckboxRender;
