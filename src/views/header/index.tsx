import Component from "@/views/PureComponent";
import { Grid, State as RootState } from "@/grid";
import { RefObject } from "preact";
import { connect, withGrid } from "@/views/root";
import { classes } from "@/utils";
import { Coordinate, MenuItem } from "@/types";
import { Menu } from "@/views/menu";
import Columns from './Columns';

import styles from './header.module.css';

interface Props {
    grid: Grid;
    // columns
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    // refs
    headerRef?: RefObject<HTMLDivElement>;
    headerContainerRef?: RefObject<HTMLDivElement>;
    normalColumnsRef?: RefObject<HTMLDivElement>;
    pinnedLeftColumnsRef?: RefObject<HTMLDivElement>;
    pinnedRightColumnsRef?: RefObject<HTMLDivElement>;
    handleColumnResizeStart?: (field: string, width: number, ev: MouseEvent) => void;
}

interface State {
    isMenuVisible?: boolean;
    contextMenuItems?: MenuItem[];
    contextMenuCoord?: Coordinate;
}

class Header extends Component<Props, State> {

    public componentDidMount = () => {
        this.resize();
    }

    public componentDidUpdate = () => {
        this.resize();
    }

    protected resize = () => {
        this.props.headerContainerRef.current.style.width = '';
        this.props.headerContainerRef.current.style.width = this.props.headerContainerRef.current.scrollWidth + 'px';
    }

    protected handleColumnContextMenu = (field: string, ev: MouseEvent) => {

        const items = this.props.grid.getColumnMenuItems(field);
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

        return (
            <div ref={this.props.headerRef} className={styles.header}>
                {this.props.pinnedLeftColumns.length > 0 && (
                    <div ref={this.props.pinnedLeftColumnsRef} className={classes([styles.pinnedLeftColumns])}>
                        <Columns
                            columns={this.props.pinnedLeftColumns}
                            onColumnResizeStart={this.props.handleColumnResizeStart}
                            onColumnContextMenu={this.handleColumnContextMenu}
                        />
                    </div>
                )}
                <div ref={this.props.normalColumnsRef} className={styles.normalColumns}>
                    <div
                        ref={this.props.headerContainerRef}
                        className={classes([styles.headerContainer])}
                    >
                        <Columns
                            columns={this.props.normalColumns}
                            onColumnResizeStart={this.props.handleColumnResizeStart}
                            onColumnContextMenu={this.handleColumnContextMenu}
                        />
                    </div>
                </div>
                {this.props.pinnedRightColumns.length > 0 && (
                    <div ref={this.props.pinnedRightColumnsRef} className={classes([styles.pinnedRightColumns])}>
                        <Columns
                            columns={this.props.pinnedRightColumns}
                            onColumnResizeStart={this.props.handleColumnResizeStart}
                            onColumnContextMenu={this.handleColumnContextMenu}
                        />
                    </div>
                )}
                {/* header menus */}
                {this.state.isMenuVisible && <Menu
                    onMenuItemClicked={this.hideContextMenu}
                    onClickOutside={this.hideContextMenu}
                    coord={this.state.contextMenuCoord}
                    items={this.state.contextMenuItems}
                />}
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => {
    return {
        pinnedLeftColumns: state.column.pinnedLeftColumns,
        pinnedRightColumns: state.column.pinnedRightColumns,
        normalColumns: state.column.normalColumns,
    };
}

export default connect(mapStateToProps)(withGrid(Header));
