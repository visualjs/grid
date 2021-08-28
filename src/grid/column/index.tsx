import GridElement from '@/grid/GridElement';
import { ColumnOptions } from '@/types';
import styles from './column.module.css';

export interface Props extends ColumnOptions {
    onResize?: (field: string, width: number, ev: MouseEvent) => void;
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

    componentDidMount = () => {
        this.grid.addListener('columnWidthChanged', this.handleColumnWidthChange);
    }

    componentWillUnmount = () => {
        this.grid.removeListener('columnWidthChanged', this.handleColumnWidthChange);
    }

    protected handleColumnWidthChange = ({ field, width }: { field: string, width: number }) => {
        if (field === this.props.field) {
            this.setState({ width });
        }
    }

    protected handleMouseDown = (ev: MouseEvent) => {
        this.props.onResize && this.props.onResize(
            this.props.field, this.refs.column.current.offsetWidth, ev
        );
    }

    render() {

        const cellStyle: { [key: string]: any } = {
            width: this.state.width
        }

        if (this.props.flex) {
            cellStyle.flexGrow = 1;
        }

        return (
            <div ref={this.createRef("column")} className={styles.headerColumn} style={cellStyle}>
                <span>{this.props.headerName}</span>
                {
                    !this.props.flex && this.props.resizable
                    && <div ref={this.createRef("resizer")} onMouseDown={this.handleMouseDown} className={styles.columnResizeHolder}></div>
                }
            </div>
        );
    }
}

export default Column;
