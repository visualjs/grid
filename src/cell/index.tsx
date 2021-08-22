import GridElement from "@/grid/GridElement";
import SelectionRange from "@/selection/SelectionRange";
import { ColumnOptions, Coordinate } from "@/types";
import { classes } from "@/utils";

import styles from './cell.module.css';

export interface CellProps {
    data: any;
    row: string;
    column: ColumnOptions;
    onMouseDown?: (row: string, col: string) => void
    onMouseMove?: (row: string, col: string) => void
    onMouseUp?: (row: string, col: string) => void
}

interface CellState {
    active?: boolean;
}

class Cell extends GridElement<CellProps, CellState> {

    protected coord: Coordinate;

    constructor(props: CellProps) {
        super(props);

        this.coord = this.grid.getCoordinate(this.props.row, this.props.column.field);
    }

    componentDidMount() {
        this.grid.addListener('selectionChanged', this.handleSelectionChanged);
    }

    componentWillUnmount() {
        this.grid.removeListener('selectionChanged', this.handleSelectionChanged);
    }

    protected handleSelectionChanged = (selections: SelectionRange[]) => {

        for(let i in selections) {
            if (selections[i].contains(this.coord)) {
                !this.state.active && this.setState({
                    active: true,
                })

                return;
            }
        }

        this.state.active && this.setState({
            active: false,
        })
    }

    protected handleMouseDown = () => {
        this.props.onMouseDown && this.props.onMouseDown(this.props.row, this.props.column.field);
    }

    protected handleMouseMove = () => {
        this.props.onMouseMove && this.props.onMouseMove(this.props.row, this.props.column.field);
    }

    protected handleMouseUp = () => {
        this.props.onMouseUp && this.props.onMouseUp(this.props.row, this.props.column.field);
    }

    render() {

        const cellStyle: { [key: string]: any } = {
            width: this.props.column.width,
        }

        if (this.props.column.flex) {
            cellStyle.flexGrow = 1;
        }

        return (
            <div
                className={classes({[styles.rowCell]: true, [styles.rowCellActive]: this.state.active})}
                style={cellStyle}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
            >
                {/* {this.props.data} */}
                {this.props.row}-{this.props.column.field}
            </div>
        );
    }

}

export default Cell;
