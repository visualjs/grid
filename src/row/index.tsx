import { h } from "@/component";
import GridElement from "@/grid/GridElement";
import Cell from '@/cell';
import { RowData } from "@/types";

import styles from './row.module.css';

interface Props {
    data: RowData;
    columns: string[];
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
                        return <Cell data={this.props.data[col]} column={this.grid.getColumnOptions(col)} />
                    })
                }
            </div>
        );
    }

}

export default Row;
