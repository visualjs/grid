import Component from "@/views/PureComponent";
import { Grid, State as RootState } from "@/grid";
import { RefObject } from "preact";
import { connect, withGrid } from "@/views/root";
import { Column, Group } from "@/views/column";
import { classes } from "@/utils";
import { Coordinate, GroupData, MenuItem } from "@/types";
import { Menu } from "@/views/menu";

import styles from './header.module.css';

interface Props {
    grid: Grid;
    height: number;
    // groups
    groups: string[][];
    groupsData: Record<string, GroupData>;
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

    protected renderColumns = (columns: string[]) => {

        const hasContextMenu = this.props.grid.state('column').getColumnMenuItems !== undefined;
        const style = {
            height: this.props.height,
            minHeight: this.props.height,
        };

        return (
            <>
                {
                    this.props.groups.map(groups => {
                        return (
                            <div className={styles.headerColumns} style={style}>
                                {
                                    groups.map(group => {
                                        return <Group value={group} columns={columns} />;
                                    })
                                }
                            </div>
                        );
                    })
                }
                <div className={styles.headerColumns} style={style}>
                    {
                        columns.map(col => {
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
                </div>
            </>
        );
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
                        {this.renderColumns(this.props.pinnedLeftColumns)}
                    </div>
                )}
                <div ref={this.props.normalColumnsRef} className={styles.normalColumns}>
                    <div
                        ref={this.props.headerContainerRef}
                        className={classes([styles.headerContainer])}
                    >
                        {this.renderColumns(this.props.normalColumns)}
                    </div>
                </div>
                {this.props.pinnedRightColumns.length > 0 && (
                    <div ref={this.props.pinnedRightColumnsRef} className={classes([styles.pinnedRightColumns])}>
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
        groups: state.column.groups,
        groupsData: state.column.groupsData,
        pinnedLeftColumns: state.column.pinnedLeftColumns,
        pinnedRightColumns: state.column.pinnedRightColumns,
        normalColumns: state.column.normalColumns,
    };
}

export default connect(mapStateToProps)(withGrid(Header));
