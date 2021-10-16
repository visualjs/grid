import { RefObject } from 'preact';
import Component from '@/views/PureComponent';
import Grid, { State as RootState } from '@/grid';
import List from '@/views/list';
import { connect, withGrid } from '@/views/root';
import { Menu } from '@/views/menu';
import { CellPosition, Coordinate, MenuItem } from '@/types';
import CellRange from '@/selection/CellRange';
import { Button } from '@/utils';
import { FillRange } from '@/selection/FillRange';
import Rows from './Rows';
import clsx from 'clsx';
import hotkeys, { HotkeysEvent } from 'hotkeys-js';

import styles from './grid.module.css';

interface Props {
    grid: Grid;
    pinnedTopRows: string[];
    pinnedBottomRows: string[];
    normalRows: string[];
    rowHeight: number;
    preloadRowCount: number;
    disabledVirtualScrolling: number | boolean;
    // actions
    getCoordinate: (row: string, column: string) => Coordinate;
    getCoordLocatedRange: (coord: Coordinate) => CellRange | undefined;
    hoverRow: (row: string) => void;
    selectCells: (start: Coordinate, end: Coordinate) => void;
    setEditing: (pos?: CellPosition) => void;
    setFilling: (filling?: FillRange) => void;
    // refs
    listRef?: RefObject<HTMLElement>;
    normalCellsContainerRef?: RefObject<HTMLDivElement>;
    pinnedTopNormalCellsContainerRef?: RefObject<HTMLDivElement>;
    pinnedBottomNormalCellsContainerRef?: RefObject<HTMLDivElement>;
    normalCellsRef?: RefObject<HTMLDivElement>;
    pinnedTopNormalCellsRef?: RefObject<HTMLDivElement>;
    pinnedBottomNormalCellsRef?: RefObject<HTMLDivElement>;
    pinnedTopRowsRef?: RefObject<HTMLDivElement>;
    pinnedBottomRowsRef?: RefObject<HTMLDivElement>;
    // handlers
    onHorizontalScroll?: (ev: UIEvent) => void;
}

interface State {
    isMenuVisible?: boolean;
    contextMenuItems?: MenuItem[];
    contextMenuCoord?: Coordinate;
}

class Body extends Component<Props, State> {
    // selection
    protected isSelecting: boolean;

    protected selectionStart: Coordinate;

    protected selectionEnd: Coordinate;

    // fill
    protected isFilling: boolean;

    protected fillingEnd: Coordinate;

    protected fillingRef: CellRange;

    protected hotkeys: string = 'ctrl+c,command+c,ctrl+v,command+v';

    componentDidMount = () => {
        document.addEventListener('mouseup', this.handleMouseUp);
        hotkeys(this.hotkeys, this.handleBindHotkeys.bind(this));
    };

    componentWillUnmount = () => {
        document.removeEventListener('mouseup', this.handleMouseUp);
        hotkeys.unbind(this.hotkeys);
    };

    // Double-click the cell to enable editing
    protected handleCellDbClick = (ev: MouseEvent, row: string, column: string) => {
        if (this.props.grid.trigger('beforeCellDbClicked', { row, column }, ev) === false) {
            return;
        }

        this.props.setEditing({ row, column });
        this.props.grid.trigger('afterCellDbClicked', { row, column }, ev);
    };

    protected handleCellMouseDown = (ev: MouseEvent, row: string, column: string) => {
        if (this.props.grid.trigger('beforeCellMouseDown', { row, column }, ev) === false) {
            return;
        }

        ev.stopPropagation();

        // stop any editing when click a cell
        this.props.grid.stopEditing();

        const coord = this.props.getCoordinate(row, column);

        // show context menu
        if (ev.button === Button.Right) {
            const items = this.props.grid.getContextMenuItems({ row, column });
            if (items.length === 0) {
                return;
            }

            if (this.props.grid.trigger('beforeContextMenuShow', { row, column }, items) === false) {
                return;
            }

            this.setState(
                {
                    isMenuVisible: true,
                    contextMenuItems: items,
                    contextMenuCoord: { x: ev.clientX, y: ev.clientY },
                },
                () => {
                    this.props.grid.trigger('afterContextMenuShow', { row, column }, items);
                }
            );

            // Avoid canceling the selection when you right-click in the selection range.
            if (this.props.grid.getCoordLocatedRange(coord)) {
                return;
            }

            // Avoid canceling the selected rows when you right-click.
            if (this.props.grid.getSelectedRows().indexOf(row) !== -1) {
                return;
            }
        } else {
            this.hideContextMenu();
        }

        if (ev.button !== Button.Left && ev.button !== Button.Right) {
            return;
        }

        // select current active row
        this.handleSelectRow(row);

        // set current active cell as selection star position
        this.selectionStart = this.selectionEnd = coord;
        this.isSelecting = true;
        this.handleSelectionChanged();

        this.props.grid.trigger('afterCellMouseDown', { row, column }, ev);
    };

    protected handleSelectRow = (row: string) => {
        if (hotkeys.shift) {
            const rows = this.props.grid.getSelectedRows();
            const lastRowIndex = this.props.grid.getRowIndex(rows[rows.length - 1]);
            const currentRowIndex = this.props.grid.getRowIndex(row);

            return this.props.grid.selectRows(rows.concat(this.props.grid.getRowsBetween(lastRowIndex, currentRowIndex)));
        }

        if (hotkeys.control || hotkeys.ctrl) {
            return this.props.grid.appendSelectedRows([row]);
        }

        this.props.grid.selectRows([row]);
    };

    protected handleCellMouseMove = (ev: MouseEvent, row: string, column: string) => {
        if (this.props.grid.trigger('beforeCellMouseMove', { row, column }, ev) === false) {
            return;
        }

        // update hovered row
        this.props.hoverRow(row);

        const coord = this.props.getCoordinate(row, column);

        // If you are selecting a cell range,
        // update the selection range according to the current hover cell
        if (this.isSelecting) {
            if (this.selectionEnd && this.selectionEnd.x == coord.x && this.selectionEnd.y == coord.y) {
                return;
            }

            this.selectionEnd = coord;
            this.handleSelectionChanged();
        }

        // If you are filling a cell range,
        // update the filling range according to the current hover cell
        if (this.isFilling) {
            if (this.fillingEnd && this.fillingEnd.x == coord.x && this.fillingEnd.y == coord.y) {
                return;
            }

            this.fillingEnd = coord;
            this.handleFillRangeChanged();
        }

        this.props.grid.trigger('afterCellMouseMove', { row, column }, ev);
    };

    protected handleCellFillerMouseDown = (ev: MouseEvent, row: string, column: string) => {
        if (this.props.grid.trigger('beforeFillerMouseDown', { row, column }, ev) === false) {
            return;
        }

        if (ev.button !== Button.Left) {
            return;
        }

        const coord = this.props.getCoordinate(row, column);
        const range = this.props.getCoordLocatedRange(coord);
        if (!range) return;

        this.fillingRef = range;
        this.fillingEnd = coord;
        this.isFilling = true;
        this.handleFillRangeChanged();

        this.props.grid.trigger('afterFillerMouseDown', { row, column }, ev);
    };

    protected handleMouseUp = () => {
        if (this.isSelecting) {
            this.isSelecting = false;
        }

        if (this.isFilling) {
            this.isFilling = false;
            this.handleFill(new FillRange(this.fillingRef, this.fillingEnd, this.props.grid.state('grid').fillable));

            this.fillingRef = this.fillingEnd = null;
            this.handleFillRangeChanged();
        }
    };

    protected handleSelectionChanged = () => {
        if (this.props.grid.trigger('beforeSelectionChange', this.selectionStart, this.selectionEnd) === false) {
            return;
        }

        this.props.selectCells(this.selectionStart, this.selectionEnd);
        this.props.grid.trigger('afterSelectionChange', this.selectionStart, this.selectionEnd);
    };

    protected handleFillRangeChanged = () => {
        this.props.setFilling(new FillRange(this.fillingRef, this.fillingEnd, this.props.grid.state('grid').fillable));
    };

    protected handleFill = (range: FillRange) => {
        if (this.props.grid.trigger('beforeFilling', range) === false) {
            return;
        }

        const ref = range.getReference();
        range.chunk((chunk) => {
            chunk.each((coord, relative) => {
                const srcCoord = ref.getGlobalCoord(relative);
                this.props.grid.setCellValueByCoord(coord, this.props.grid.getCellValueByCoord(srcCoord));
            });
        });

        this.props.grid.trigger('afterFilling', range);
    };

    protected handleBlur = () => {
        this.props.grid.selectRows([]);
        this.selectionStart = this.selectionEnd = null;
        this.handleSelectionChanged();
    };

    protected handleBindHotkeys = (ev: KeyboardEvent, handler: HotkeysEvent) => {
        if (this.props.grid.trigger('beforeKeyDown', ev) === false) {
            return;
        }

        switch (handler.key) {
            case 'ctrl+c':
            case 'command+c':
                this.props.grid.copySelection();
                break;
            case 'ctrl+v':
            case 'command+v':
                this.props.grid.pasteFromClipboard();
                break;
        }

        this.props.grid.trigger('afterKeyDown', ev);
    };

    protected handleKeyPress = (ev: KeyboardEvent) => {
        if (this.props.grid.trigger('beforeKeyPress', ev) === false) {
            return;
        }
        this.props.grid.trigger('afterKeyPress', ev);
    };

    protected handleKeyUp = (ev: KeyboardEvent) => {
        if (this.props.grid.trigger('beforeKeyUp', ev) === false) {
            return;
        }

        this.props.grid.trigger('afterKeyUp', ev);
    };

    protected hideContextMenu = () => {
        if (this.state.isMenuVisible) {
            this.setState({ isMenuVisible: false });
        }
    };

    /**
     * Renders
     */
    protected listRender = (items: string[]) => {
        return (
            <Rows
                items={items}
                onCellDbClick={this.handleCellDbClick}
                onCellMouseDown={this.handleCellMouseDown}
                onCellMouseMove={this.handleCellMouseMove}
                onCellFillerMouseDown={this.handleCellFillerMouseDown}
                handleHorizontalScroll={this.props.onHorizontalScroll}
                normalCellsRef={this.props.normalCellsRef}
                normalCellsContainerRef={this.props.normalCellsContainerRef}
            />
        );
    };

    render() {
        const handleContextMenu = this.props.grid.state('grid').getContextMenuItems
            ? (ev: MouseEvent) => {
                  ev.preventDefault();
              }
            : undefined;

        return (
            <div
                className={styles.body}
                onBlur={this.handleBlur}
                onMouseLeave={() => this.props.hoverRow(undefined)}
                onContextMenu={handleContextMenu}
                onKeyUp={this.handleKeyUp}
                onKeyPress={this.handleKeyPress}
            >
                {this.state.isMenuVisible && (
                    <Menu
                        onMenuItemClicked={this.hideContextMenu}
                        onClickOutside={this.hideContextMenu}
                        coord={this.state.contextMenuCoord}
                        items={this.state.contextMenuItems}
                    />
                )}
                {
                    <div
                        className={clsx(styles.pinnedTopRows, {
                            [styles.noBorder]: this.props.pinnedTopRows.length === 0,
                        })}
                    >
                        <Rows
                            selfRef={this.props.pinnedTopRowsRef}
                            items={this.props.pinnedTopRows}
                            onCellDbClick={this.handleCellDbClick}
                            onCellMouseDown={this.handleCellMouseDown}
                            onCellMouseMove={this.handleCellMouseMove}
                            onCellFillerMouseDown={this.handleCellFillerMouseDown}
                            handleHorizontalScroll={this.props.onHorizontalScroll}
                            normalCellsRef={this.props.pinnedTopNormalCellsRef}
                            normalCellsContainerRef={this.props.pinnedTopNormalCellsContainerRef}
                        />
                    </div>
                }
                <List
                    ref={this.props.listRef}
                    items={this.props.normalRows}
                    itemHeight={this.props.rowHeight}
                    preLoadCount={this.props.preloadRowCount}
                    disabledVirtualScrolling={this.props.disabledVirtualScrolling}
                    render={this.listRender}
                />
                <div
                    className={clsx(styles.pinnedBottomRows, {
                        [styles.noBorder]: this.props.pinnedBottomRows.length === 0,
                    })}
                >
                    <Rows
                        selfRef={this.props.pinnedBottomRowsRef}
                        items={this.props.pinnedBottomRows}
                        onCellDbClick={this.handleCellDbClick}
                        onCellMouseDown={this.handleCellMouseDown}
                        onCellMouseMove={this.handleCellMouseMove}
                        onCellFillerMouseDown={this.handleCellFillerMouseDown}
                        handleHorizontalScroll={this.props.onHorizontalScroll}
                        normalCellsRef={this.props.pinnedBottomNormalCellsRef}
                        normalCellsContainerRef={this.props.pinnedBottomNormalCellsContainerRef}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        preloadRowCount: state.grid.preloadRowCount,
        disabledVirtualScrolling: state.grid.disabledVirtualScrolling,
        rowHeight: state.row.height,
    };
};

const mapActionsToProps = (grid: Grid) => {
    return {
        getCoordinate: (row: string, column: string) => {
            return grid.getCoordinate(row, column);
        },
        getCoordLocatedRange: (coord: Coordinate): CellRange | undefined => {
            return grid.getCoordLocatedRange(coord);
        },
        hoverRow: (row: string) => {
            return grid.store('row').dispatch('setHoveredRow', row);
        },
        selectCells: (start: Coordinate, end: Coordinate) => {
            return grid.store('cell').dispatch('selectCells', { start, end });
        },
        setEditing: (pos?: CellPosition) => {
            return grid.setEditing(pos);
        },
        setFilling: (filling?: FillRange) => {
            return grid.store('cell').dispatch('setFilling', filling);
        },
    };
};

export default connect(mapStateToProps, mapActionsToProps)(withGrid(Body));
