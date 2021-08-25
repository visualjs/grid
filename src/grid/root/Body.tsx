import { Coordinate } from "@/types";
import Row from "@/grid/row";
import GridElement from "@/grid/GridElement";
import SelectionRange from "@/selection/SelectionRange";

import styles from './grid.module.css';
import { Button } from "@/utils";

interface Props {
    items: string[];
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    horizontalScrollLeft: number;
}

class Body extends GridElement<Props> {

    protected isSelecting: boolean;

    protected selectionStart: Coordinate;

    protected selectionEnd: Coordinate;

    componentDidMount = () => {
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount = () => {
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    protected handleCellDbClick = (ev: MouseEvent, row: string, column: string) => {
        this.grid.startEditingCell({ row, column });
    }

    protected handleCellMouseDown = (ev: MouseEvent, row: string, col: string) => {
        if (!(ev.button === Button.Left)) {
            return;
        }

        this.selectionStart = this.selectionEnd = this.grid.getCoordinate(row, col);
        this.isSelecting = true;
        this.handleSelectionChanged();
        this.grid.stopEditing();
    }

    protected handleCellMouseMove = (ev: MouseEvent, row: string, col: string) => {
        if (!this.isSelecting) {
            return;
        }

        const coord = this.grid.getCoordinate(row, col);
        if (this.selectionEnd && this.selectionEnd.x == coord.x && this.selectionEnd.y == coord.y) {
            return;
        }

        this.selectionEnd = coord;
        this.handleSelectionChanged();
    }

    protected handleMouseUp = () => {
        this.isSelecting = false;
        this.handleSelectionChanged();
    }

    protected handleSelectionChanged = () => {
        this.grid.trigger('selectionChanged', [
            new SelectionRange(this.selectionStart, this.selectionEnd)
        ]);
    }

    protected renderRows = (columns: string[]) => {
        return this.props.items.map(row => {
            return (
                <Row
                    key={row}
                    grid={this.grid}
                    value={row}
                    columns={columns}
                    onCellDbClick={this.handleCellDbClick}
                    onCellMouseDown={this.handleCellMouseDown}
                    onCellMouseMove={this.handleCellMouseMove}
                />
            )
        })
    }

    render() {
        return (
            <div style={{ display: 'flex' }}>
                <div className={styles.pinnedLeftCells}>
                    {this.renderRows(this.props.pinnedLeftColumns)}
                </div>
                <div className={styles.normalCells}>
                    <div style={{ transform: `translateX(-${this.props.horizontalScrollLeft}px)` }}>
                        {this.renderRows(this.props.normalColumns)}
                    </div>
                </div>
                <div className={styles.pinnedRightCells}>
                    {this.renderRows(this.props.pinnedRightColumns)}
                </div>
            </div>
        );
    }

}

export default Body;
