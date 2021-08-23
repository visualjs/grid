import GridElement from "@/grid/GridElement";
import SelectionRange from "@/selection/SelectionRange";
import { ColumnOptions, Coordinate } from "@/types";
import { classes, isObjectEqual } from "@/utils";
import { createRef } from "preact";

import styles from './cell.module.css';

interface CellProps {
    data: any;
    row: string;
    column: ColumnOptions;
    onMouseDown?: (row: string, col: string) => void
    onMouseMove?: (row: string, col: string) => void
    onMouseUp?: (row: string, col: string) => void
}

interface Boundary {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}

interface CellState {
    active?: boolean;
    selected?: boolean;
    boundary: Boundary;
}

class Cell extends GridElement<CellProps, CellState> {

    protected cell = createRef<HTMLDivElement>();

    protected coord: Coordinate;

    protected timer: number = null;

    constructor(props: CellProps) {
        super(props);

        this.state = {
            selected: false,
            active: false,
            boundary: { left: false, top: false, bottom: false, right: false }
        }

        this.coord = this.grid.getCoordinate(this.props.row, this.props.column.field);
    }

    componentDidMount() {
        this.grid.addListener('selectionChanged', this.handleSelectionChanged);
        this.handleSelectionChanged(this.grid.getSelectionRanges());
        this.doRender();
    }

    componentWillUnmount() {
        this.grid.removeListener('selectionChanged', this.handleSelectionChanged);
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    protected doRender() {
        let result: HTMLElement | string = this.props.data;

        if (this.props.column.cellRender) {
            this.timer = setTimeout(() => {
                const render = new this.props.column.cellRender();
                render.init && render.init({
                    props: this.props.column.cellRendererParams,
                    value: this.props.data,
                    column: this.props.column,
                });

                this.timer = null;

                if (!this.cell.current) {
                    return;
                }
                this.cell.current.appendChild(render.gui());
                render.afterAttached && render.afterAttached();
            }, 0)
        } else {
            this.cell.current.textContent = result.toString();
        }
    }

    protected handleSelectionChanged = (selections: SelectionRange[]) => {

        let selected = false;
        let boundary = { left: false, top: false, bottom: false, right: false };

        for (let i in selections) {
            const s = selections[i];
            if (!s.contains(this.coord)) {
                continue;
            }

            selected = true;

            s.isLeft(this.coord) && (boundary.left = true);
            s.isRight(this.coord) && (boundary.right = true);
            s.isTop(this.coord) && (boundary.top = true);
            s.isBottom(this.coord) && (boundary.bottom = true);
        }

        if (selected != this.state.selected || !isObjectEqual(boundary, this.state.boundary)) {
            this.setState({
                selected: selected,
                boundary: boundary
            })
        }
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

        const className = classes({
            [styles.cell]: true,
            [styles.cellSelected]: this.state.selected,
            [styles.cellLeftBoundary]: this.state.boundary.left,
            [styles.cellRightBoundary]: this.state.boundary.right,
            [styles.cellTopBoundary]: this.state.boundary.top,
            [styles.cellBottomBoundary]: this.state.boundary.bottom,
        })

        return (
            <div
                ref={this.cell}
                className={className}
                style={cellStyle}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
            />
        );
    }

}

export default Cell;
