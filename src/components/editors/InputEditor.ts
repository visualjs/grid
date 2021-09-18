import { CellEditor, CellEditorParams } from "@/grid/cell";
import styles from '@/components/styles/input.module.css';

interface Props {
    type?: string;
}

const defaultProps = {
    type: 'text',
}

export class InputEditor extends CellEditor<Props> {

    protected input: HTMLInputElement;

    public init(params: CellEditorParams<Props>) {
        const props = Object.assign({}, defaultProps, params.props);

        if (!this.input) {
            this.input = document.createElement('input');
            this.input.type = props.type;
            this.input.className = styles.inlineInput;

            this.input.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') {
                    params.gird.stopEditing();
                }
            });
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

export default InputEditor;
