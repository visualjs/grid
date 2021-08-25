import GridElement from "@/grid/GridElement";
import Cell from '@/grid/cell';

import styles from './row.module.css';
import { createRef } from "preact";
import { DOM } from "@/utils";

interface Props {
    value: string;
    columns: string[];
    onCellDbClick?: (ev: MouseEvent, row: string, col: string) => void
    onCellMouseDown?: (ev: MouseEvent, row: string, col: string) => void
    onCellMouseMove?: (ev: MouseEvent, row: string, col: string) => void
    onCellMouseUp?: (ev: MouseEvent, row: string, col: string) => void
}

class Row extends GridElement<Props> {

    protected row = createRef<HTMLDivElement>();

    componentDidMount = () => {
        this.grid.addListener('hoveredRowChanged', this.handleRowHoverd);
        this.grid.addListener('selectedRowsChanged', this.handleRowSelected);
    }

    componentWillUnmount = () => {
        this.grid.removeListener('hoveredRowChanged', this.handleRowHoverd);
        this.grid.removeListener('selectedRowsChanged', this.handleRowSelected);
    }

    protected handleRowSelected = (rows: string[]) => {
        const index = rows.findIndex(r => r === this.props.value);
        if (index !== -1) {
            DOM.appendClassName(this.row.current, styles.rowCellsSelect);
        } else {
            DOM.removeClassName(this.row.current, styles.rowCellsSelect);
        }
    }

    protected handleRowHoverd = (row?: string) => {
        if (row === this.props.value) {
            DOM.appendClassName(this.row.current, styles.rowCellsHover);
        } else {
            DOM.removeClassName(this.row.current, styles.rowCellsHover);
        }
    }

    render() {

        const style = {
            height: this.grid.getRowHeight(),
            minHeight: this.grid.getRowHeight(),
        }

        return (

            <div ref={this.row} className={styles.rowCells} style={style}>
                {
                    this.props.columns.map(col => {
                        return (
                            <Cell
                                onDbClick={this.props.onCellDbClick}
                                onMouseDown={this.props.onCellMouseDown}
                                onMouseMove={this.props.onCellMouseMove}
                                onMouseUp={this.props.onCellMouseUp}
                                grid={this.grid}
                                row={this.props.value}
                                column={this.grid.getColumnOptions(col)}
                            />
                        )
                    })
                }
            </div>
        );
    }

}

export default Row;
