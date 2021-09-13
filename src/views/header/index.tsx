import Component from "@/views/PureComponent";
import { Grid, State as RootState } from "@/grid";
import { RefObject } from "preact";
import { connect, withGrid } from "@/views/root";
import Column from "@/views/column";
import { classes } from "@/utils";
import { Coordinate, MenuItem } from "@/types";
import { Menu } from "@/views/menu";

import styles from './header.module.css';

interface Props {
    grid: Grid;
    height: number;
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

    protected renderColumns = (columns: string[]) => {

        const hasContextMenu = this.props.grid.state('column').getColumnMenuItems !== undefined;

        return columns.map(col => {
            return (
                <Column
                    key={col}
                    value={col}
                    onResize={this.props.handleColumnResizeStart}
                    onContextMenu={hasContextMenu ? this.handleColumnContextMenu : undefined}
                />
            );
        })
    }

    protected hideContextMenu = () => {
        if (this.state.isMenuVisible) {
            this.setState({ isMenuVisible: false });
        }
    }

    render() {

        const headerStyle = {
            height: this.props.height,
            minHeight: this.props.height,
        };

        return (
            <div ref={this.props.headerRef} className={styles.header} style={headerStyle}>
                {this.props.pinnedLeftColumns.length > 0 && (
                    <div ref={this.props.pinnedLeftColumnsRef} className={classes([styles.pinnedLeftColumns, styles.headerColumns])}>
                        {this.renderColumns(this.props.pinnedLeftColumns)}
                    </div>
                )}
                <div ref={this.props.normalColumnsRef} className={styles.normalColumns}>
                    <div
                        ref={this.props.headerContainerRef}
                        className={classes([styles.headerContainer, styles.headerColumns])}
                    >
                        {this.renderColumns(this.props.normalColumns)}
                    </div>
                </div>
                {this.props.pinnedRightColumns.length > 0 && (
                    <div ref={this.props.pinnedRightColumnsRef} className={classes([styles.pinnedRightColumns, styles.headerColumns])}>
                        {this.renderColumns(this.props.pinnedRightColumns)}
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
        height: state.column.height,
        pinnedLeftColumns: state.column.pinnedLeftColumns,
        pinnedRightColumns: state.column.pinnedRightColumns,
        normalColumns: state.column.normalColumns,
    };
}

export default connect(mapStateToProps)(withGrid(Header));
