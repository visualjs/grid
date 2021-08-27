import { CellEditor, CellEditorParams } from "@/grid/cell";
import styles from '@/components/styles/input.module.css';

export class StringEditor extends CellEditor<{}> {

    protected input: HTMLInputElement;

    public init(params: CellEditorParams<{}>) {
        if (!this.input) {
            this.input = document.createElement('input');
            this.input.type = 'text';
            this.input.className = styles.inlineInput;
        }

        this.input.value = params.value;
    }

    public gui(): HTMLElement {
        return this.input;
    }

    public afterAttached() {
        this.input.focus();
        this.input.select();
    }

    public getValue(): any {
        if (!this.input) {
            return '';
        }

        return this.input.value;
    }
}

export default StringEditor;
