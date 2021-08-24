import { CellRenderer, CellRendererParams } from '@/grid/cell';

interface Props {
    openInBlank?: boolean;
}

export class HyperlinkRender extends CellRenderer<Props> {

    protected element: HTMLAnchorElement = document.createElement('a');

    public init(params: CellRendererParams<Props>) {

        const props = Object.assign({ openInBlank: true }, params.props);

        if ('object' === typeof params.value) {
            const link = params.value.link;
            const title = params.value.title || link;

            this.element.href = link;
            this.element.innerText = title;
        }

        if (props.openInBlank) {
            this.element.target = '_blank';
        }
    }

    public gui(): HTMLElement {
        return this.element;
    }

}

export default HyperlinkRender;
