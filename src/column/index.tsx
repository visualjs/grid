import Component, { h } from '@/component';
import { ColumnOptions } from '@/types';
import styles from './column.module.css';

export interface ColumnProps extends ColumnOptions {
    onResize?: (field: string, width: number) => void;
}

class Column extends Component<ColumnProps> {

    protected startPos: number | null = null;

    constructor(props: ColumnProps) {
        super(props);

        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    protected handleMouseDown = (ev: MouseEvent) => {
        this.startPos = ev.clientX;
        this.refs.resizer.style.borderRightWidth = '4px';
    }

    protected handleMouseUp = (ev: MouseEvent) => {
        if (this.startPos !== null && this.props.onResize) {
            const width = this.refs.resizer.offsetLeft;

            this.refs.resizer.style.right = '0px';
            this.refs.resizer.style.borderRightWidth = '0px';

            this.updateWidth(width);
            this.props.onResize(this.props.field, width);
        }

        this.startPos = null;
    }

    protected handleMouseMove = (ev: MouseEvent) => {
        if (this.startPos !== null) {
            this.updateResizer(ev.clientX - this.startPos);
        }
    }

    protected updateResizer = (offset: number) => {
        if (this.refs.resizer) {
            this.refs.resizer.style.right = -offset + 'px';
        }
    }

    protected updateWidth = (width: number) => {
        if (width < this.props.minWidth) {
            width = this.props.minWidth;
        }

        this.refs.column.style.width = width + 'px';
    }

    render() {

        const cellStyle: { [key: string]: any } = {
            width: this.props.width
        }

        if (this.props.flex) {
            cellStyle.flexGrow = 1;
        }

        return (
            <div ref={this.createRef("column")} className={styles.headerColumn} style={cellStyle}>
                <span>{this.props.headerName}</span>
                {
                    this.props.resizable 
                    && <div ref={this.createRef("resizer")} onMouseDown={this.handleMouseDown} className={styles.columnResize}></div>
                }
            </div>
        );
    }
}

export default Column;
