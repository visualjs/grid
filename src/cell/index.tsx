import GridElement from "@/grid/GridElement";
import { ColumnOptions } from "@/types";

import styles from './cell.module.css';

export interface CellProps {
    data: any;
    row: string;
    column: ColumnOptions;
}

class Cell extends GridElement<CellProps> {

    protected handleClick = () => {
        console.log({
            row: this.props.row,
            col: this.props.column.field,
        })
    }

    render() {

        const cellStyle: { [key: string]: any } = {
            width: this.props.column.width
        }

        if (this.props.column.flex) {
            cellStyle.flexGrow = 1;
        }

        return (
            <div onClick={this.handleClick} className={styles.rowCell} style={cellStyle}>
                {this.props.data}
            </div>
        );
    }

}

export default Cell;
