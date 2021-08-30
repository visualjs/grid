import { Coordinate } from "@/types";
import Row from "@/grid/row";
import GridElement from "@/grid/GridElement";
import { Button, readTextFromClipboard, writeTextToClipboard } from "@/utils";
import CellRange from "@/selection/CellRange";

import styles from './grid.module.css';
import { FillRange } from "@/selection/FillRange";

interface Props {
    items: string[];
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    horizontalScrollLeft: number;
}

class Body extends GridElement<Props> {

    // selection
    protected isSelecting: boolean;

    protected selectionStart: Coordinate;

    protected selectionEnd: Coordinate;

    // fill
    protected isFilling: boolean;

    protected fillingEnd: Coordinate;

    protected fillingRef: CellRange;

    componentDidMount = () => {
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount = () => {
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    // copy and paste
    protected handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'c' && (ev.ctrlKey || ev.metaKey)) {
            return this.copyFromSelection();
        }

        if (ev.key === 'v' && (ev.ctrlKey || ev.metaKey)) {
            return this.pasteFromClipboard();
        }
    }

    protected copyFromSelection = () => {
        let text = '';
        this.grid.getSelectionRanges().forEach((range) => {
            let lastRow = -1;
            range.each(coord => {
                if (lastRow !== -1) {
                    text += coord.y !== lastRow ? '\n' : '\t';
                }

                text += this.grid.getCellValueByCoord(coord);
                lastRow = coord.y;
            });
        })

        writeTextToClipboard(text);
    }

    protected pasteFromClipboard = () => {

        const start = this.grid.getSelectionRanges()[0]?.start;
        if (!start) return;

        readTextFromClipboard().then(str => {
            str = str.replace(/(\r\n|\r|\n)/g, '\n');
            str.split('\n').forEach((rowData, y) => {
                rowData.split('\t').forEach((value, x) => {
                    const coord = { x: x + start.x, y: y + start.y };
                    this.grid.setCellValueByCoord(coord, value);
                });
            });
        });
    }

    // Double-click the cell to enable editing
    protected handleCellDbClick = (ev: MouseEvent, row: string, column: string) => {
        this.grid.stopEditing();
        this.grid.startEditingCell({ row, column });
    }

    protected handleCellMouseDown = (ev: MouseEvent, row: string, col: string) => {
        if (!(ev.button === Button.Left)) {
            return;
        }

        // select current active row
        this.grid.selectRows([row]);
        // set current active cell as selection star position
        this.selectionStart = this.selectionEnd = this.grid.getCoordinate(row, col);
        this.isSelecting = true;
        this.handleSelectionChanged();
        // stop any editing when click a cell
        this.grid.stopEditing();
    }

    protected handleCellFillerMouseDown = (ev: MouseEvent, row: string, col: string) => {
        if (!(ev.button === Button.Left)) {
            return;
        }

        const coord = this.grid.getCoordinate(row, col);
        const ranges = this.grid.getSelectionRanges();

        for (let i = 0; i < ranges.length; i++) {
            if (ranges[i].contains(coord)) {
                this.fillingRef = ranges[i];
                this.fillingEnd = coord;
                this.isFilling = true;
                this.handleFillRangeChanged();
                return;
            }
        }
    }

    protected handleCellMouseMove = (ev: MouseEvent, row: string, col: string) => {
        // update hovered row
        this.grid.setHoveredRow(row);
        const coord = this.grid.getCoordinate(row, col);

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
            this.handleFill(new FillRange(this.fillingRef, this.fillingEnd, this.grid.getOptions().fillable));

            this.fillingRef = this.fillingEnd = null;
            this.handleFillRangeChanged();
        }
    }

    protected handleFill = (range: FillRange) => {
        const ref = range.getReference();
        range.chunk(chunk => {
            chunk.each((coord, relative) => {
                const value = ref.getGlobalCoord(relative);
                this.grid.setCellValueByCoord(coord, this.grid.getCellValueByCoord(value));
            });
        });
    }

    protected handleSelectionChanged = () => {
        this.grid.selectCells(this.selectionStart, this.selectionEnd);
    }

    protected handleFillRangeChanged = () => {
        this.grid.trigger('fillingRangeChanged', new FillRange(
            this.fillingRef, this.fillingEnd, this.grid.getOptions().fillable
        ));
    }

    protected handleBlur = () => {
        this.grid.selectRows([]);
        this.selectionStart = this.selectionEnd = null;
        this.grid.selectCells(null, null);
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
                    onCellFillerMouseDown={this.handleCellFillerMouseDown}
                />
            )
        })
    }

    render() {
        return (
            <div
                onKeyDown={this.handleKeyDown}
                onBlur={this.handleBlur}
                tabIndex={0} style={{ display: 'flex', outline: 'none' }}
                onMouseLeave={() => this.grid.setHoveredRow()}
            >
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
