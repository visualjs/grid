import GridElement from '@/grid/GridElement';
import { ColumnOptions } from '@/types';
import styles from './column.module.css';

export interface Props extends ColumnOptions {
    onResize?: (field: string, width: number) => void;
}

interface State {
    width: number;
}

class Column extends GridElement<Props, State> {

    protected startPos: number | null = null;

    constructor(props: Props) {
        super(props);

        this.state = {
            width: props.width
        }
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    protected handleMouseDown = (ev: MouseEvent) => {
        this.startPos = ev.clientX;
        this.refs.resizer.current.style.borderRightWidth = '4px';
    }

    protected handleMouseUp = (ev: MouseEvent) => {
        if (this.startPos !== null && this.props.onResize) {
            const width = this.refs.resizer.current.offsetLeft;
            this.refs.resizer.current.style.right = '0px';
            this.refs.resizer.current.style.borderRightWidth = '0px';

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
        if (this.refs.resizer.current) {
            this.refs.resizer.current.style.right = -offset + 'px';
        }
    }

    protected updateWidth = (width: number) => {
        if (width < this.props.minWidth) {
            width = this.props.minWidth;
        }

        this.setState({ width });
    }

    render() {

        const cellStyle: { [key: string]: any } = {
            width: this.state.width
        }

        if (this.props.flex) {
            cellStyle.flexGrow = 1;
        }

        return (
            <div className={styles.headerColumn} style={cellStyle}>
                <span>{this.props.headerName}</span>
                {
                    !this.props.flex && this.props.resizable
                    && <div ref={this.createRef("resizer")} onMouseDown={this.handleMouseDown} className={styles.columnResize}></div>
                }
            </div>
        );
    }
}

export default Column;
