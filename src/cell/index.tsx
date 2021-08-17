import { ColumnProps } from "@/column";
import Component, { h } from "@/component";

import styles from './cell.module.css';

export interface CellProps {
    data: any;
    column: ColumnProps;
}

const defaultColumnOptions = {
    width: 200,
};

class Cell extends Component {

    constructor(private props: CellProps) {
        super();

        this.props.column = Object.assign(
            defaultColumnOptions, this.props.column
        );
    }

    render(): HTMLElement {

        const cellStyle: { [key: string]: any } = {
            width: this.props.column.width
        }

        if (this.props.column.flex) {
            cellStyle.flexGrow = 1;
        }

        return (
            <div className={styles.rowCell} style={cellStyle}>
                {this.props.data}
            </div>
        );
    }

}

export default Cell;
