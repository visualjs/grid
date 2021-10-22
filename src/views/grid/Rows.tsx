import Component from "@/views/PureComponent";
import { Grid, State as RootState } from "@/grid";
import { connect } from "@/views/root";
import Row from "@/views/row";
import Cell from "@/views/cell";
import withGrid from "@/views/root/withGrid";
import { CellInfo, RowInfo, VirtualGrid } from "@/views/virtual-grid";
import { ColumnOptions } from "@/types";

import styles from "./grid.module.css";
import { arrayMoveImmutable } from "@/utils";

interface CellElement {
    column: string;
    row: string;
    el: HTMLDivElement;
}

interface Props {
    grid: Grid;
    items: string[];
    // columns
    columns: Record<string, ColumnOptions>;
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    // rows
    rowHeight: number;
    // overscan and throttle
    overscanColumnCount: number,
    overscanRowCount: number,
    scrollThrottleRate: number;
    // events
    onWheelHorizontal?: (ev: WheelEvent) => void;
    onScrollHorizontal?: (ev: Event) => void;
    onScrollVertical?: (ev: Event) => void;
    onCellDbClick?: (ev: MouseEvent, cell: HTMLDivElement, row: string, col: string) => void;
    onCellMouseDown?: (ev: MouseEvent, cell: HTMLDivElement, row: string, col: string) => void;
    onCellMouseMove?: (ev: MouseEvent, cell: HTMLDivElement, row: string, col: string) => void;
    onCellMouseUp?: (ev: MouseEvent, cell: HTMLDivElement, row: string, col: string) => void;
    onFillerMouseDown?: (ev: MouseEvent, filler: HTMLDivElement, row: string, col: string) => void;
    // refs
    getScrollXNode?: (node: HTMLDivElement) => void;
    getScrollYNode?: (node: HTMLDivElement) => void;
}

class Rows extends Component<Props> {

    protected root: HTMLDivElement;

    protected ghost?: HTMLDivElement;

    protected dragIndicator: HTMLDivElement;

    protected currentDragStartRow?: string;

    protected currentDragEndRow?: string;

    protected renderCell = ({ row, column, style }: CellInfo) => {
        return (
            <Cell
                key={column}
                row={row}
                column={column}
                style={style}
            />
        );
    }

    protected renderRow = ({ row, style, cells }: RowInfo) => {
        return (
            <Row key={row} value={row} style={style}>
                {cells}
            </Row>
        );
    }

    protected getActiveCell = (ev: Event, type: string = "__isCell"): CellElement => {
        let el: any = ev.target;
        let column: string, row: string;
        while (el != this.root) {
            // see if the dom element has column and row info
            if (el.__column && el.__row && el[type] === true) {
                // if yes, we have found the cell, and know which row and column it is
                column = el.__column;
                row = el.__row;
                break;
            }
            el = el.parentElement;
        }

        const editing = this.props.grid.state('cell').editing || { column: undefined, row: undefined };
        if (column && row && (column !== editing.column || row !== editing.row)) {
            return { column, row, el: el }
        }
    }

    protected handleDbClick = (ev: MouseEvent) => {
        if (typeof this.props.onCellDbClick !== 'function') {
            return;
        }
        const cell = this.getActiveCell(ev);
        cell && this.props.onCellDbClick(ev, cell.el, cell.row, cell.column);
    }

    protected handleMouseDown = (ev: MouseEvent) => {
        if (typeof this.props.onCellMouseDown !== 'function') {
            return;
        }
        const rowDragHandle = this.getActiveCell(ev, '__dragHandle');
        if (rowDragHandle) {
            return this.handleDragStart(ev, this.getActiveCell(ev));
        }

        const filler = this.getActiveCell(ev, '__filler');
        if (filler) {
            return this.props.onFillerMouseDown(ev, filler.el, filler.row, filler.column);
        }

        const cell = this.getActiveCell(ev);
        if (cell) {
            return this.props.onCellMouseDown(ev, cell.el, cell.row, cell.column);
        }
    }

    protected handleMouseUp = (ev: MouseEvent) => {
        if (typeof this.props.onCellMouseUp !== 'function') {
            return;
        }
        const cell = this.getActiveCell(ev);
        cell && this.props.onCellMouseUp(ev, cell.el, cell.row, cell.column);
    }

    protected handleMouseMove = (ev: MouseEvent) => {
        // if a row is being dragged, update the ending row by current active cell.
        if (this.currentDragStartRow) {
            return this.updateDragEndRow(this.getActiveCell(ev));
        }

        if (typeof this.props.onCellMouseMove !== 'function') {
            return;
        }
        const cell = this.getActiveCell(ev);
        cell && this.props.onCellMouseMove(ev, cell.el, cell.row, cell.column);
    }

    protected handleDragStart = (ev: MouseEvent, cell?: CellElement) => {
        if (!cell) return;
        if (!this.props.grid.trigger('beforeRowDragStart', cell.row)) {
            return;
        }

        if (!this.ghost) {
            this.ghost = document.createElement('div');
            this.ghost.className = styles.rowDragGhost;
        }
        const text = this.props.grid.getCellValue(cell.row, cell.column);
        this.ghost.innerHTML = `
            <span class="vg-move ${styles.ghostIcon}"></span>
            <span>${text}</span>
        `;
        this.props.grid.appendChild(this.ghost);

        document.addEventListener('mousemove', this.updateDragGhost);
        document.addEventListener('mouseup', this.handleDragEnd);

        this.currentDragStartRow = cell.row;
        this.dragIndicator.style.display = 'block';
        this.updateDragEndRow(cell);
        this.updateDragGhost(ev);

        this.props.grid.trigger('afterRowDragStart', cell.row);
    }

    protected updateDragGhost = (ev: MouseEvent) => {
        if (!this.ghost) return;
        const rootRect = this.props.grid.getRootElement().getBoundingClientRect();
        this.ghost.style.left = ev.clientX - rootRect.left + 10 + 'px';
        this.ghost.style.top = ev.clientY - rootRect.top + 10 + 'px';
    }

    protected handleDragEnd = () => {
        document.removeEventListener('mouseup', this.handleDragEnd);
        document.removeEventListener('mousemove', this.updateDragGhost);
        this.props.grid.removeChild(this.ghost);
        this.dragIndicator.style.display = 'none';

        const start = this.currentDragStartRow;
        const end = this.currentDragEndRow;
        this.currentDragStartRow = this.currentDragEndRow = undefined;

        if (!this.props.grid.trigger('beforeRowDragEnd', start, end)) {
            return;
        }

        const store = this.props.grid.store('row');
        const oldRowIndex = store.getRowInternalIndex(start);
        const newRowIndex = store.getRowInternalIndex(end);
        if (oldRowIndex !== undefined && newRowIndex !== undefined && oldRowIndex != newRowIndex) {
            store.sortRows((rows) => {
                return arrayMoveImmutable(rows, oldRowIndex, newRowIndex);
            });
        }

        this.props.grid.trigger('afterRowDragEnd', start, end);
    }

    protected updateDragEndRow = (cell?: CellElement) => {
        if (!cell) return;
        const rootRect = this.root.getBoundingClientRect();
        const cellRect = cell.el.parentElement.getBoundingClientRect();
        this.currentDragEndRow = cell.row;
        this.dragIndicator.style.top = (cellRect.top - rootRect.top) + 'px';
        this.dragIndicator.style.height = cellRect.height + 'px';
    }

    render() {
        return (
            <div
                ref={node => this.root = node}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseMove={this.handleMouseMove}
                onDblClick={this.handleDbClick}
                style={{ width: '100%', height: '100%', position: 'relative' }}
            >
                <div ref={node => this.dragIndicator = node} className={styles.rowDragIndicator}></div>
                <VirtualGrid
                    rows={this.props.items}
                    rowHeight={this.props.rowHeight}
                    columns={this.props.normalColumns}
                    pinnedLeftClassName={styles.pinnedLeftCells}
                    pinnedRightClassName={styles.pinnedRightCells}
                    pinnedLeftColumns={this.props.pinnedLeftColumns}
                    pinnedRightColumns={this.props.pinnedRightColumns}
                    columnWidth={(column) => {
                        const options = this.props.grid.getColumnOptions(column);
                        return Math.max(options?.width, options?.minWidth);
                    }}
                    throttleRate={this.props.scrollThrottleRate}
                    overscanRowCount={this.props.overscanRowCount}
                    overscanColumnCount={this.props.overscanColumnCount}
                    renderRow={this.renderRow}
                    renderCell={this.renderCell}
                    onWheelHorizontal={this.props.onWheelHorizontal}
                    onScrollHorizontal={this.props.onScrollHorizontal}
                    onScrollVertical={this.props.onScrollVertical}
                    getScrollXNode={this.props.getScrollXNode}
                    getScrollYNode={this.props.getScrollYNode}
                />
            </div>
        );
    };
}

const mapStateToProps = (state: RootState) => {
    return {
        columns: state.column.columns,
        overscanColumnCount: state.grid.overscanColumnCount,
        overscanRowCount: state.grid.overscanRowCount,
        scrollThrottleRate: state.grid.scrollThrottleRate,
        pinnedLeftColumns: state.column.pinnedLeftColumns,
        pinnedRightColumns: state.column.pinnedRightColumns,
        normalColumns: state.column.normalColumns,
        rowHeight: state.row.height,
    };
};

export default connect(mapStateToProps)(withGrid(Rows));
