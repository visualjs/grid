import { Coordinate } from "@/types";
import Row from "@/grid/row";
import GridElement from "@/grid/GridElement";
import { Button, readTextFromClipboard, writeTextToClipboard } from "@/utils";

import styles from './grid.module.css';

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

    protected handleCellDbClick = (ev: MouseEvent, row: string, column: string) => {
        this.grid.stopEditing();
        this.grid.startEditingCell({ row, column });
    }

    protected handleCellMouseDown = (ev: MouseEvent, row: string, col: string) => {
        if (!(ev.button === Button.Left)) {
            return;
        }

        this.grid.selectRows([row]);
        this.selectionStart = this.selectionEnd = this.grid.getCoordinate(row, col);
        this.isSelecting = true;
        this.handleSelectionChanged();
        this.grid.stopEditing();
    }

    protected handleCellMouseMove = (ev: MouseEvent, row: string, col: string) => {
        this.grid.setHoveredRow(row);

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
        this.grid.selectCells(this.selectionStart, this.selectionEnd);
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
