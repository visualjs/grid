import GridElement from "@/grid/GridElement";
import Cell from '@/grid/cell';

import styles from './row.module.css';

interface Props {
    value: string;
    columns: string[];
    onCellMouseDown?: (row: string, col: string) => void
    onCellMouseMove?: (row: string, col: string) => void
    onCellMouseUp?: (row: string, col: string) => void
}

class Row extends GridElement<Props> {

    render() {

        const style = {
            height: this.grid.getRowHeight(),
            minHeight: this.grid.getRowHeight(),
        }

        return (

            <div className={styles.rowCells} style={style}>
                {
                    this.props.columns.map(col => {
                        return (
                            <Cell
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
