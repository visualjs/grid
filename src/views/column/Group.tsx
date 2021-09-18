import Component from "@/views/PureComponent";
import { connect, withGrid } from "@/views/root";
import Grid, { State as RootState } from "@/grid";
import { ColumnOptions, GroupData } from "@/types";
import { classes } from "@/utils";

import styles from './column.module.css';

export interface Props {
    grid: Grid;
    value: string;
    data: GroupData;
    columns: string[];
    options: Record<string, ColumnOptions>;
}

class Group extends Component<Props> {

    protected get data() {
        return this.props.data;
    }

    protected toggleCollapsed = () => {
        this.props.grid.store('column').toggleGroupCollapsed(this.props.value);
    }

    render() {

        const options = this.props.grid.store('column').getGroupWidth(this.props.value, this.props.columns);

        if (options.width === 0) {
            return null;
        }

        const cellStyle: { [key: string]: any } = { width: options.width }

        if (options.flex) {
            cellStyle.flexGrow = options.flex;
        }

        const className = classes([styles.columnIcon, this.data.collapsed ? 'vg-cheveron-right' : 'vg-cheveron-left']);

        return (
            <div className={styles.headerColumn} style={cellStyle}>
                <span>{this.data.headerName}</span>
                {
                    this.data.collapsible && (
                        <span onClick={this.toggleCollapsed} className={className}></span>
                    )
                }
            </div>
        );
    }
}

export default connect((state: RootState, { props }: { props: Props }) => {
    return {
        options: state.column.columns,
        data: state.column.groupsData[props.value],
    };
})(withGrid(Group));
