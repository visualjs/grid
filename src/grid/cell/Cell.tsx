import GridElement from "@/grid/GridElement";
import SelectionRange from "@/selection/SelectionRange";
import { CellPosition, ColumnOptions, Coordinate } from "@/types";
import { classes, isObjectEqual } from "@/utils";
import { DOM } from "@/utils";
import { createRef } from "preact";
import { CellValueChangedEvent } from "../Events";

import styles from './cell.module.css';
import CellEditor from "./CellEditor";

interface CellProps {
    row: string;
    column: ColumnOptions;
    onDbClick?: (ev: MouseEvent, row: string, col: string) => void;
    onMouseDown?: (ev: MouseEvent, row: string, col: string) => void
    onMouseMove?: (ev: MouseEvent, row: string, col: string) => void
    onMouseUp?: (ev: MouseEvent, row: string, col: string) => void
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

    protected io: IntersectionObserver;

    protected isEditing: boolean;

    protected editor: CellEditor<any>;

    constructor(props: CellProps) {
        super(props);

        this.state = {
            selected: false,
            active: false,
            boundary: { left: false, top: false, bottom: false, right: false }
        }

        this.coord = this.grid.getCoordinate(this.props.row, this.props.column.field);
        this.io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.doRender();
                this.io.disconnect();
            }
        })
    }

    componentDidMount() {
        this.grid.addListener('selectionChanged', this.handleSelectionChanged);
        this.grid.addListener('cellValueChanged', this.handleCellValueChanged);
        this.grid.addListener('startCellEditing', this.handleStartCellEditing);
        this.grid.addListener('stopEditing', this.handleStopEditing);
        this.handleSelectionChanged(this.grid.getSelectionRanges());
        this.io.observe(this.cell.current);
    }

    componentWillUnmount() {
        this.grid.removeListener('selectionChanged', this.handleSelectionChanged);
        this.grid.removeListener('cellValueChanged', this.handleCellValueChanged);
        this.grid.removeListener('startCellEditing', this.handleStartCellEditing);
        this.grid.removeListener('stopEditing', this.handleStopEditing);
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    protected getValue(): any {
        return this.grid.getCellValue(this.props.row, this.props.column.field);
    }

    public setValue(value: any) {
        this.grid.setCellValue(this.props.row, this.props.column.field, value);
    }

    // render cell component
    protected doRender() {
        const value = this.getValue();
        let result: HTMLElement | string = value;

        if (this.props.column.cellRender) {
            this.timer = setTimeout(() => {
                const render = new this.props.column.cellRender();
                render.init && render.init({
                    props: this.props.column.CellRendererParams,
                    value: value,
                    column: this.props.column,
                });

                this.timer = null;

                if (!this.cell.current) {
                    return;
                }

                DOM.clean(this.cell.current);
                this.cell.current.appendChild(render.gui());
                render.afterAttached && render.afterAttached();
            }, 0);
        } else {
            this.cell.current && (this.cell.current.textContent = result.toString());
        }
    }

    // If the current cell is selected, modify the cell to be selected style
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
            });
        }
    }

    // Re-render the cell when the value changes
    protected handleCellValueChanged = (ev: CellValueChangedEvent) => {
        if (ev.row === this.props.row && ev.column === this.props.column.field) {
            this.doRender();
        }
    }

    // 
    // Editing
    // 

    protected handleStartCellEditing = (pos: CellPosition) => {
        if (pos.row !== this.props.row || pos.column !== this.props.column.field || !this.props.column.cellEditor) {
            return;
        }

        this.isEditing = true;
        const popup = document.createElement('div');
        popup.className = styles.cellEditingPopup;
        DOM.clean(this.cell.current);
        DOM.appendClassName(this.cell.current, styles.cellEditing);

        if (!this.editor) {
            this.editor = new this.props.column.cellEditor();
        }

        this.editor.init && this.editor.init({
            props: this.props.column.cellEditorParams,
            value: this.getValue(),
            column: this.props.column,
        });

        popup.appendChild(this.editor.gui());
        this.cell.current.appendChild(popup);
        this.editor.afterAttached && this.editor.afterAttached();
    }

    protected handleStopEditing = () => {
        if (!this.isEditing) {
            return;
        }

        this.isEditing = false;
        DOM.setClassNames(this.cell.current, [styles.cell]);
        this.setValue(this.editor.getValue());
    }

    // Event handlers
    protected handleMouseDown = (ev: MouseEvent) => {
        if (this.isEditing) return;
        this.props.onMouseDown && this.props.onMouseDown(ev, this.props.row, this.props.column.field);
    }

    protected handleMouseMove = (ev: MouseEvent) => {
        if (this.isEditing) return;
        this.props.onMouseMove && this.props.onMouseMove(ev, this.props.row, this.props.column.field);
    }

    protected handleMouseUp = (ev: MouseEvent) => {
        if (this.isEditing) return;
        this.props.onMouseUp && this.props.onMouseUp(ev, this.props.row, this.props.column.field);
    }

    protected handleDbClick = (ev: MouseEvent) => {
        if (this.isEditing) return;
        this.props.onDbClick && this.props.onDbClick(ev, this.props.row, this.props.column.field);
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
                onDblClick={this.handleDbClick}
            />
        );
    }

}

export default Cell;
