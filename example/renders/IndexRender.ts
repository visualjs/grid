import { CellRenderer, CellRendererParams } from "@/grid/cell";

import styles from './style.module.css';

export class IndexRender extends CellRenderer {

    protected wrapper: HTMLDivElement = document.createElement('div');

    protected index: HTMLSpanElement = document.createElement('span');

    protected enlarge: HTMLSpanElement = document.createElement('span');

    public init(params: CellRendererParams<{}>) {
        this.wrapper.className = styles.indexWrapper;

        this.index.innerText = String(Number(params.value) + 1);
        this.enlarge.className = `vg-enlarge-simplicit ${styles.indexEnlarge}`;
        this.enlarge.addEventListener('click', () => {
            console.log('enlarge - ' + params.row);
        });

        this.wrapper.appendChild(this.index);
        this.wrapper.appendChild(this.enlarge);
    }

    public gui(): HTMLElement {
        return this.wrapper;
    }
}

export default IndexRender;
