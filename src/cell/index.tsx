import { ColumnProps } from "@/column";
import Component, { h } from "@/component";

import styles from './cell.module.css';

export interface CellProps {
    data: any;
    column: ColumnProps;
}

class Cell extends Component<CellProps> {

    constructor(protected props: CellProps) {
        super(props);
    }

    render() {

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
