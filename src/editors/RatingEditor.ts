import { CellEditor, CellEditorParams } from "@/grid/cell";

import styles from './styles/rating.module.css';

interface Props {
    max?: number;
    size?: number;
    activeColor?: string;
    defaultColor?: string;
}

const defaultProps = {
    max: 10,
    size: 14,
    activeColor: '#fadb13',
    defaultColor: '#dedede',
}

export class RatingEditor extends CellEditor<Props> {

    protected editor: HTMLDivElement;

    protected elements: HTMLSpanElement[] = [];

    protected value: number = 0;

    protected props: Props = {};

    public init(params: CellEditorParams<Props>) {
        this.props = Object.assign({}, defaultProps, params.props);

        if (!this.editor) {
            this.editor = document.createElement('div');
            this.editor.className = styles.inlineRatingWrapper;
            for (let i = 1; i <= this.props.max; i++) {
                const e = document.createElement('span');
                e.className = "vg-star-full";
                e.style.fontSize = this.props.size + 'px';

                e.addEventListener('click', () => {
                    this.setValue(this.value == i ? 0 : i);
                })

                e.addEventListener('mouseover', () => {
                    this.active(i);
                })

                e.addEventListener('mouseout', () => {
                    this.setValue(this.value);
                })

                this.elements.push(e);
                this.editor.appendChild(e);
            }
        }

        this.setValue(params.value);
    }

    public gui(): HTMLElement {
        return this.editor;
    }

    protected setValue(value: number) {
        this.value = value;
        this.active(this.value);
    }

    protected active(index: number) {
        this.elements.forEach((e, i) => {
            if (i < index) {
                e.style.color = this.props.activeColor;
            } else {
                e.style.color = this.props.defaultColor;
            }
        })
    }

    public getValue(): any {
        return this.value;
    }
}

export default RatingEditor;
