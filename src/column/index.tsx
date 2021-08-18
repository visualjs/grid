import Component, { h } from '@/component';
import styles from './column.module.css';

export interface ColumnProps {
    field: string;
    width?: number; // default is 200
    flex?: number;
    headerName?: string;
    resizable?: boolean;
    pinned?: 'left' | 'right';
}


class Column extends Component<ColumnProps> {
    constructor(private options: ColumnProps, private children: any) {
        super();
    }

    render() {

        const cellStyle: { [key: string]: any } = {
            width: this.options.width
        }

        if (this.options.flex) {
            cellStyle.flexGrow = 1;
        }

        return (
            <div className={styles.headerColumn} style={cellStyle}>
                {this.options.headerName}
                <div className={styles.columnResize}></div>
            </div>
        );
    }
}

export default Column;
