import { CellEditor, CellEditorParams } from "@/grid/cell";

import styles from '@/components/styles/checkbox.module.css';
import { DOM } from "@/utils";

export class CheckboxEditor extends CellEditor<{}> {

    protected wrapper: HTMLDivElement;

    protected checkbox: HTMLDivElement;

    protected mark: HTMLSpanElement;

    protected value: boolean;

    public init(param: CellEditorParams<{}>) {
        if (!this.wrapper) {
            this.wrapper = document.createElement('div');
            this.wrapper.className = styles.inlineCheckboxWrapper;
            this.checkbox = document.createElement('div');
            this.checkbox.className = `${styles.inlineCheckbox} ${styles.inlineCheckboxEditor}`;
            this.mark = document.createElement('span');
            this.mark.className="vg-checkmark";

            this.checkbox.appendChild(this.mark);
            this.wrapper.appendChild(this.checkbox);

            this.checkbox.addEventListener('click', () => {
                this.setValue(!this.value);
            });
        }

        this.setValue(Boolean(param.value));
    }

    protected setValue(value: boolean) {
        this.value = value;
        if (this.value) {
            DOM.appendClassName(this.checkbox, styles.inlineCheckboxChecked);
        } else {
            DOM.removeClassName(this.checkbox, styles.inlineCheckboxChecked);
        }
    }

    public gui(): HTMLElement {
        return this.wrapper;
    }

    public getValue(): any {
        return this.value;
    }
}

export default CheckboxEditor;
