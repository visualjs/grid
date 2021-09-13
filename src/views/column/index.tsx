import Component from "@/views/PureComponent";
import { connect, withGrid } from "@/views/root";
import { Grid, State as RootState } from "@/grid";
import { ColumnOptions, Coordinate, MenuItem } from "@/types";
import { Menu } from "@/views/menu";

import styles from './column.module.css';

export interface Props {
    value: string;
    options: ColumnOptions;
    grid: Grid;
    onResize?: (field: string, width: number, ev: MouseEvent) => void;
}

interface State {
    isMenuVisible?: boolean;
    contextMenuItems?: MenuItem[];
    contextMenuCoord?: Coordinate;
}

class Column extends Component<Props, State> {

    protected get options() {
        return this.props.options;
    }

    protected handleMouseDown = (ev: MouseEvent) => {
        this.props.onResize && this.props.onResize(
            this.options.field, this.refs.column.current.offsetWidth, ev
        );
    }

    protected handleContextMenu = (ev: MouseEvent) => {

        const items = this.props.grid.getColumnMenuItems(this.props.value);
        if (items.length === 0) {
            return;
        }

        this.setState({
            isMenuVisible: true, contextMenuItems: items,
            contextMenuCoord: { x: ev.clientX, y: ev.clientY }
        });

        ev.stopPropagation();
    }

    protected hideContextMenu = () => {
        if (this.state.isMenuVisible) {
            this.setState({ isMenuVisible: false });
        }
    }

    render() {

        const cellStyle: { [key: string]: any } = {
            width: this.options.width
        }

        if (this.options.flex) {
            cellStyle.flexGrow = this.options.flex;
        }

        return (
            <div ref={this.createRef("column")} className={styles.headerColumn} style={cellStyle}>
                {this.state.isMenuVisible && <Menu
                    onMenuItemClicked={this.hideContextMenu}
                    onClickOutside={this.hideContextMenu}
                    coord={this.state.contextMenuCoord}
                    items={this.state.contextMenuItems}
                />}
                <span>{this.options.headerName}</span>
                {
                    this.props.grid.state('column').getColumnMenuItems
                    && <span onClick={this.handleContextMenu} className={`${styles.columnIcon} ${styles.columnIconHiden} vg-menu`}></span>
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
})(withGrid(Column));
