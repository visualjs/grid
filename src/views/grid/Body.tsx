import Component from "@/views/Component";
import { Grid, State as RootState } from "@/grid";
import { connect } from "@/views/root";
import Row from '@/views/row';
import { CellPosition, Coordinate, MenuItem } from "@/types";
import { Button } from "@/utils";
import withGrid from "@/views/root/withGrid";
import CellRange from "@/selection/CellRange";
import { FillRange } from "@/selection/FillRange";
import { Menu } from "@/views/menu";

import styles from './grid.module.css';

interface Props {
    grid: Grid;
    items: string[];
    // columns
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    // rows
    rowHeight: number;
    // actions
    getCoordinate: (row: string, column: string) => Coordinate;
    getCoordLocatedRange: (coord: Coordinate) => CellRange | undefined;
    hoverRow: (row: string) => void;
    selectRows: (rows: string[]) => void;
    selectCells: (start: Coordinate, end: Coordinate) => void;
    setEditing: (pos?: CellPosition) => void;
    setFilling: (filling?: FillRange) => void;
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

    protected unsubscribe: () => void;

    componentDidMount = () => {
        document.addEventListener('mouseup', this.handleMouseUp);

        this.unsubscribe = this.props.grid.store('grid').subscribeAny(() => {
            const sl = this.props.grid.state('grid').horizontalScrollLeft;
            this.refs.normalColumns.current.style.transform = `translateX(-${sl}px)`;
        });
    }

    componentWillUnmount = () => {
        document.removeEventListener('mouseup', this.handleMouseUp);

        this.unsubscribe();
    }

    // copy and paste
    protected handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'c' && (ev.ctrlKey || ev.metaKey)) {
            return this.props.grid.copySelection();
        }

        if (ev.key === 'v' && (ev.ctrlKey || ev.metaKey)) {
            return this.props.grid.pasteFromClipboard();
        }
    }

    // Double-click the cell to enable editing
    protected handleCellDbClick = (ev: MouseEvent, row: string, column: string) => {
        this.props.setEditing({ row, column });
    }

    protected handleCellMouseDown = (ev: MouseEvent, row: string, column: string) => {
        // stop any editing when click a cell
        this.props.setEditing();

        const coord = this.props.getCoordinate(row, column);

        // show context menu
        if (ev.button === Button.Right) {
            const items = this.props.grid.getContextMenuItems({ row, column });
            if (items.length === 0) {
                return;
            }

            this.setState({
                isMenuVisible: true, contextMenuItems: items,
                contextMenuCoord: { x: ev.pageX, y: ev.pageY }
            });

            // Avoid canceling the selection when you right-click in the selection range
            if (this.props.grid.getCoordLocatedRange(coord)) {
                return;
            }
        } else {
            this.hideContextMenu();
        }

        if (ev.button !== Button.Left && ev.button !== Button.Right) {
            return;
        }

        // select current active row
        this.props.selectRows([row]);
        // set current active cell as selection star position
        this.selectionStart = this.selectionEnd = coord;
        this.isSelecting = true;
        this.handleSelectionChanged();
    }

    protected handleCellMouseMove = (ev: MouseEvent, row: string, col: string) => {
        // update hovered row
        this.props.hoverRow(row);

        const coord = this.props.getCoordinate(row, col);

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
    }

    protected handleMouseUp = () => {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.handleSelectionChanged();
        }

        if (this.isFilling) {
            this.isFilling = false;
            this.handleFill(new FillRange(this.fillingRef, this.fillingEnd, this.props.grid.state('grid').fillable));

            this.fillingRef = this.fillingEnd = null;
            this.handleFillRangeChanged();
        }
    }

    protected handleCellFillerMouseDown = (ev: MouseEvent, row: string, col: string) => {

        if (ev.button !== Button.Left) {
            return;
        }

        const coord = this.props.getCoordinate(row, col);
        const range = this.props.getCoordLocatedRange(coord);
        if (!range) return;

        this.fillingRef = range;
        this.fillingEnd = coord;
        this.isFilling = true;
        this.handleFillRangeChanged();
    }

    protected handleBlur = () => {
        this.props.selectRows([]);
        this.selectionStart = this.selectionEnd = null;
        this.handleSelectionChanged();
    }

    protected handleSelectionChanged = () => {
        this.props.selectCells(this.selectionStart, this.selectionEnd);
    }

    protected handleFillRangeChanged = () => {
        this.props.setFilling(new FillRange(
            this.fillingRef, this.fillingEnd, this.props.grid.state('grid').fillable
        ));
    }

    protected hideContextMenu = () => {
        if (this.state.isMenuVisible) {
            this.setState({ isMenuVisible: false });
        }
    }

    protected handleFill = (range: FillRange) => {
        const ref = range.getReference();
        range.chunk(chunk => {
            chunk.each((coord, relative) => {
                const srcCoord = ref.getGlobalCoord(relative);
                this.props.grid.setCellValueByCoord(coord, this.props.grid.getCellValueByCoord(srcCoord))
            });
        });
    }

    /**
     * Renders
     */
    protected renderRows = (columns: string[]) => {
        return this.props.items.map(row => {
            return (
                <Row
                    key={row}
                    value={row}
                    baseHeight={this.props.rowHeight}
                    columns={columns}
                    onCellDbClick={this.handleCellDbClick}
                    onCellMouseDown={this.handleCellMouseDown}
                    onCellMouseMove={this.handleCellMouseMove}
                    onCellFillerMouseDown={this.handleCellFillerMouseDown}
                />
            )
        })
    }

    render() {

        const handleContextMenu = this.props.grid.state('grid').getContextMenuItems
            ? (ev: MouseEvent) => { ev.preventDefault(); }
            : undefined;

        return (
            <div
                onKeyDown={this.handleKeyDown}
                onBlur={this.handleBlur}
                tabIndex={0}
                style={{ display: 'flex', outline: 'none', position: 'relative' }}
                onMouseLeave={() => this.props.hoverRow(undefined)}
                onContextMenu={handleContextMenu}
            >
                {this.state.isMenuVisible && <Menu
                    onMenuItemClicked={this.hideContextMenu}
                    coord={this.state.contextMenuCoord}
                    items={this.state.contextMenuItems}
                />}
                {this.props.pinnedLeftColumns.length > 0 && (
                    <div className={styles.pinnedLeftCells}>
                        {this.renderRows(this.props.pinnedLeftColumns)}
                    </div>
                )}
                {this.props.normalColumns.length > 0 && (
                    <div className={styles.normalCells}>
                        <div ref={this.createRef('normalColumns')}>
                            {this.renderRows(this.props.normalColumns)}
                        </div>
                    </div>
                )}
                {this.props.pinnedRightColumns.length > 0 && (
                    <div className={styles.pinnedRightCells}>
                        {this.renderRows(this.props.pinnedRightColumns)}
                    </div>
                )}
            </div>
        );
    };
}

const mapStateToProps = (state: RootState) => {
    return {
        pinnedLeftColumns: state.column.pinnedLeftColumns,
        pinnedRightColumns: state.column.pinnedRightColumns,
        normalColumns: state.column.normalColumns,
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
        selectRows: (rows: string[]) => {
            return grid.store('row').dispatch('selectRows', rows);
        },
        selectCells: (start: Coordinate, end: Coordinate) => {
            return grid.store('cell').dispatch('selectCells', { start, end });
        },
        setEditing: (pos?: CellPosition) => {
            return grid.store('cell').dispatch('setEditing', pos);
        },
        setFilling: (filling?: FillRange) => {
            return grid.store('cell').dispatch('setFilling', filling);
        }
    };
}

export default connect(mapStateToProps, mapActionsToProps)(withGrid(Body));
