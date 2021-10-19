import Component from "@/views/PureComponent";
import { Grid, State as RootState } from "@/grid";
import { connect } from "@/views/root";
import Row from "@/views/row";
import Cell from "@/views/cell";
import withGrid from "@/views/root/withGrid";
import { CellInfo, RowInfo, VirtualGrid } from "@/views/virtual-grid";
import { ColumnOptions } from "@/types";

import styles from "./grid.module.css";
import { createRef } from "preact";

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

    protected getActiveCell = (ev: Event, filler?: boolean): { column: string, row: string, el: HTMLDivElement } => {
        let el: any = ev.target;
        let column: string, row: string;
        while (el != this.root) {
            // see if the dom element has column and row info
            if (el.__column && el.__row && el.__filler === filler) {
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
        const filler = this.getActiveCell(ev, true);
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
        if (typeof this.props.onCellMouseMove !== 'function') {
            return;
        }
        const cell = this.getActiveCell(ev);
        cell && this.props.onCellMouseMove(ev, cell.el, cell.row, cell.column);
    }

    render() {
        return (
            <div
                ref={node => this.root = node}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseMove={this.handleMouseMove}
                onDblClick={this.handleDbClick}
                style={{ width: '100%', height: '100%' }}
            >
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
