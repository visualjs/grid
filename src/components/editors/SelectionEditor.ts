import { CellEditor, CellEditorParams } from '@/grid/cell';
import { Option, BaseOption } from '@/components/renders/SelectionRender';
import { DOM } from '@/utils';

import styles from '@/components/styles/selection.module.css';

interface Props {
    options?: Record<string, Option>;
    defaultOption?: BaseOption;
    multiple?: boolean;
}

const defaultProps = {
    options: {},
    defaultOption: {
        fgColor: '#333333',
        bgColor: '#eaeaea'
    }
}

export class SelectionEditor extends CellEditor<Props> {

    protected wrapper: HTMLDivElement;

    protected options: Record<string, HTMLDivElement> = {};

    protected value: string[] = [];

    protected props: Props;

    public init(params: CellEditorParams<Props>) {
        if (!this.wrapper) {
            this.props = Object.assign({}, defaultProps, params.props);
            this.wrapper = document.createElement('div');
            this.wrapper.className = styles.inlineSelectionsEditor;
            Object.keys(this.props.options).forEach(o => {
                const bg = this.props.options[o].bgColor || this.props.defaultOption.bgColor;
                const fg = this.props.options[o].fgColor || this.props.defaultOption.fgColor;
                const name = this.props.options[o].name || o;
                this.options[o] = document.createElement('div');
                this.options[o].className = styles.inlineSelectionEditingOption;
                this.options[o].innerHTML = `<span class="${styles.inlineSelectionOption}" style="background: ${bg}; color: ${fg}">${name}</span>`;
                this.options[o].addEventListener('click', () => this.toggleSelect(o));
                this.wrapper.appendChild(this.options[o]);
            });
        }

        this.setValue(params.value);
    }

    public gui(): HTMLElement {
        return this.wrapper;
    }

    public isPopup(): boolean {
        return true;
    }

    public getValue(): any {
        return this.value;
    }

    public setValue(value: any) {
        if (!Array.isArray(value)) {
            return;
        }

        this.value = value;
        Object.values(this.options).forEach(o => {
            DOM.removeClassName(o, styles.inlineSelectionActiveOption);
        })

        this.value.forEach(o => {
            this.options[o] && DOM.appendClassName(this.options[o], styles.inlineSelectionActiveOption);
        });
    }

    protected toggleSelect(value: any) {
        const index = this.value.findIndex(v => v == value);

        if (this.props.multiple) {
            if (index === -1) {
                this.value.push(value);
            } else {
                this.value.splice(index, 1);
            }

            return this.setValue(this.value);
        }
        
        index === -1 ? this.setValue([value]) : this.setValue([]);
    }
}

export default SelectionEditor;
