import Component from "@/views/PureComponent";
import { connect } from "@/views/root";
import { State as RootState } from "@/grid";
import { ColumnOptions } from "@/types";
import { JSXInternal } from "preact/src/jsx";

import styles from './column.module.css';

export interface Props {
    value: string;
    options: ColumnOptions;
    onResize?: (field: string, width: number, ev: MouseEvent) => void;
    onContextMenu?: (field: string, ev: MouseEvent) => void;
}

class Column extends Component<Props> {

    protected get options() {
        return this.props.options;
    }

    protected handleMouseDown = (ev: MouseEvent) => {
        this.props.onResize && this.props.onResize(
            this.options.field, this.refs.column.current.offsetWidth, ev
        );
    }

    protected handleContextMenu = (ev: MouseEvent) => {
        if (this.props.onContextMenu) {
            this.props.onContextMenu(this.props.value, ev);
        }
    }

    render() {

        const cellStyle: JSXInternal.CSSProperties = {
            width: this.options.width
        }

        if (this.options.flex) {
            cellStyle.flexGrow = this.options.flex;
        }

        return (
            <div ref={this.createRef("column")} className={styles.headerColumn} style={cellStyle}>
                <span>{this.options.headerName}</span>
                {
                    this.props.onContextMenu
                    && <span onClick={this.handleContextMenu} className={`${styles.columnIcon} vg-menu`}></span>
                }
                {
                    !this.options.flex && this.options.resizable
                    && <div ref={this.createRef("resizer")} onMouseDown={this.handleMouseDown} className={styles.columnResizeHolder}></div>
                }
            </div>
        );
    }
}

export default connect((state: RootState, { props }: { props: Props }) => {
    return {
        options: state.column.columns[props.value],
    };
})(Column);
