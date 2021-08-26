import { CellRenderer, CellRendererParams } from '@/grid/cell';

interface Props {
    max?: number;
    size?: number;
    activeColor?: string;
}

const defaultProps = {
    max: 10,
    size: 14,
    activeColor: '#fadb13',
}

export class RatingRender extends CellRenderer<Props> {

    protected element: HTMLDivElement = document.createElement('div');

    public init(params: CellRendererParams<Props>) {
        const props = Object.assign({}, defaultProps, params.props);

        const value = Math.min(Number(params.value), props.max);
        if (value <= 0) {
            return;
        }

        const style = `color: ${props.activeColor}; font-size: ${props.size}px;`;
        let html = '';

        for (let i = 0; i < value; i++) {
            html += `<span style="${style}" class="vg-star-full"></span>`;
        }

        this.element.innerHTML = html;
    }

    public gui(): HTMLElement {
        return this.element;
    }

}

export default RatingRender;
