import Component from "@/views/PureComponent";
import { createRef } from "preact";
import { Grid, State as RootState } from "@/grid";
import { ColumnOptions, Fillable } from "@/types";
import { classes, DOM } from "@/utils";
import { withGrid } from "@/views/root";
import { CellEditor, CellRenderer } from "@/grid/cell";
import { JSXInternal } from "preact/src/jsx";

import styles from './cell.module.css';

interface Props {
    grid: Grid;
    row: string;
    column: string;
    style?: JSXInternal.CSSProperties;
}

interface State {
    isSelected: boolean;
    isLeftSelected: boolean;
    isRightSelected: boolean;
    isTopSelected: boolean;
    isBottomSelected: boolean;
    isFilling: boolean;
    isLeftFilling: boolean;
    isRightFilling: boolean;
    isTopFilling: boolean;
    isBottomFilling: boolean;
    fillable: Fillable;
}

class Cell extends Component<Props, State> {

    protected cell: HTMLDivElement;

    protected filler: HTMLDivElement;

    protected resizer: HTMLDivElement;

    protected dragHandle: HTMLDivElement;

    protected cellContent = createRef<HTMLDivElement>();

    protected popup: HTMLDivElement = null;

    protected isEditing: boolean = false;

    protected cellEditor: CellEditor<any>;

    protected cellRender: CellRenderer<any>;

    protected unsubscribes: (() => void)[] = [];

    get grid() {
        return this.props.grid;
    }

    get options(): ColumnOptions {
        return this.grid.getColumnOptions(this.props.column, this.props.row);
    }

    componentDidMount = () => {
        this.bindMetaData();
        this.doRender();

        this.unsubscribes.push(this.props.grid.store('cell').subscribeAny(() => {

            const selectBoundary = this.grid.getSelectBoundary(this.props.row, this.props.column);
            const fillingBoundary = this.options?.readonly ? undefined : this.grid.getFillingBoundary(this.props.row, this.props.column);

            this.setState({
                fillable: this.grid.state('grid').fillable,
                isSelected: selectBoundary !== undefined,
                isLeftSelected: selectBoundary && selectBoundary.left,
                isRightSelected: selectBoundary && selectBoundary.right,
                isTopSelected: selectBoundary && selectBoundary.top,
                isBottomSelected: selectBoundary && selectBoundary.bottom,
                isFilling: fillingBoundary !== undefined,
                isLeftFilling: fillingBoundary && fillingBoundary.left,
                isRightFilling: fillingBoundary && fillingBoundary.right,
                isTopFilling: fillingBoundary && fillingBoundary.top,
                isBottomFilling: fillingBoundary && fillingBoundary.bottom,
            })
        }));

        if (!this.options.cellEditor || this.options.readonly) {
            return;
        }

        this.unsubscribes.push(this.props.grid.store('cell').subscribeAny(() => {
            const state = this.props.grid.state('cell');
            const pos = state.editing;
            const shouldEditing = Boolean(pos && pos.row === this.props.row && pos.column === this.props.column);

            if (this.isEditing !== shouldEditing) {
                this.isEditing = shouldEditing;
                this.handleCellEditing();
            }
        }));
    }

    componentWillUnmount = () => {
        this.unsubscribes.forEach(fn => fn());
        this.props.grid.removeChild(this.popup);

        // clean cell render and cell editor
        if (this.cellRender && this.cellRender.beforeDestroy) {
            this.cellRender.beforeDestroy();
        }
        if (this.cellEditor && this.cellEditor.beforeDestroy) {
            this.cellEditor.beforeDestroy();
        }
    }

    componentDidUpdate = () => {
        this.doRender();
        this.bindMetaData();
    }

    protected bindMetaData = () => {
        (this.cell as any).__isCell = true;
        (this.cell as any).__column = this.props.column;
        (this.cell as any).__row = this.props.row;

        if (this.dragHandle) {
            (this.dragHandle as any).__dragHandle = true;
            (this.dragHandle as any).__column = this.props.column;
            (this.dragHandle as any).__row = this.props.row;
        }

        if (this.filler) {
            (this.filler as any).__filler = true;
            (this.filler as any).__column = this.props.column;
            (this.filler as any).__row = this.props.row;
        }

        if (this.resizer) {
            (this.resizer as any).__resizer = true;
            (this.resizer as any).__column = this.props.column;
            (this.resizer as any).__row = this.props.row;
        }
    }

    // Actions
    protected getValue(raw: boolean = false): any {
        if (raw) {
            return this.grid.getRawCellValue(this.props.row, this.props.column);
        }

        return this.props.grid.getCellValue(this.props.row, this.props.column);
    }

    public setValue(value: any) {
        this.props.grid.setCellValue(
            this.props.row,
            this.props.column,
            value
        );
    }

    // Editing
    protected handleCellEditing = () => {

        if (!this.isEditing) {
            if (this.cellEditor) {
                DOM.setClassNames(this.cellContent.current, [styles.cellContent]);
                this.setValue(this.cellEditor.getValue());
                this.doRender();
            }
            return;
        }

        const editor = document.createElement('div');
        DOM.clean(this.cellContent.current);
        DOM.appendClassName(this.cellContent.current, styles.cellEditing);

        // clean up the cell editor before.
        if (this.cellEditor && this.cellEditor.beforeDestroy) {
            this.cellEditor.beforeDestroy();
        }

        this.cellEditor = new this.options.cellEditor();
        this.cellEditor.init && this.cellEditor.init({
            props: this.options.cellParams,
            value: this.getValue(true),
            column: this.options,
            row: this.props.row,
            gird: this.props.grid,
        });

        editor.appendChild(this.cellEditor.gui());
        editor.className = styles.cellEditingWrapper;

        if (this.cellEditor.isPopup()) {
            this.createPopup(editor);
        } else {
            this.cellContent.current.appendChild(editor);
        }

        this.cellEditor.afterAttached && this.cellEditor.afterAttached();
    }

    protected createPopup = (editor: HTMLElement) => {
        if (!this.popup) {
            this.popup = document.createElement('div');
            this.popup.className = styles.cellPopupContainer;
        }

        DOM.clean(this.popup);

        const rootRect = this.props.grid.getRootElement().getBoundingClientRect();
        const rect = this.cell.getBoundingClientRect();

        this.popup.style.left = rect.left - rootRect.left + 'px';
        this.popup.style.top = rect.top - rootRect.top + 'px';
        this.popup.style.minWidth = rect.width + 'px';
        this.popup.style.minHeight = rect.height + 'px';
        this.popup.appendChild(editor);
        this.props.grid.appendChild(this.popup);
    }

    // render cell component
    protected doRender() {
        if (this.isEditing) return;

        if (!this.options.cellRender) {
            this.cellContent.current && (this.cellContent.current.textContent = this.getValue());
            return;
        }

        // clean up the cell render before.
        if (this.cellRender && this.cellRender.beforeDestroy) {
            this.cellRender.beforeDestroy();
        }

        this.cellRender = new this.options.cellRender();
        this.cellRender.init && this.cellRender.init({
            props: this.options.cellParams,
            value: this.getValue(true),
            column: this.options,
            row: this.props.row,
            gird: this.props.grid,
        });

        if (!this.cellContent.current) {
            return;
        }

        this.props.grid.removeChild(this.popup);
        DOM.clean(this.cellContent.current);
        this.cellContent.current.appendChild(this.cellRender.gui());
        this.cellRender.afterAttached && this.cellRender.afterAttached();
    }

    render() {

        let dragable = this.options.rowDragable === true;
        if (typeof this.options.rowDragable === 'function') {
            dragable = this.options.rowDragable({ row: this.props.row, column: this.props.column, grid: this.props.grid });
        }

        const cellClassParam = { column: this.props.column, row: this.props.row, grid: this.props.grid };
        const className = classes(
            // set class(es) for a particular cell.
            this.options.cellClass || [],
            this.options.getCellClass ? this.options.getCellClass(cellClassParam) : [],
            {
                [styles.cell]: true,
                [styles.cellSelected]: this.state.isSelected,
                [styles.cellLeftBoundary]: this.state.isLeftSelected,
                [styles.cellRightBoundary]: this.state.isRightSelected,
                [styles.cellTopBoundary]: this.state.isTopSelected,
                [styles.cellBottomBoundary]: this.state.isBottomSelected,
                [styles.cellFilling]: this.state.isFilling,
                [styles.cellFillingLeftBoundary]: this.state.isLeftFilling,
                [styles.cellFillingRightBoundary]: this.state.isRightFilling,
                [styles.cellFillingTopBoundary]: this.state.isTopFilling,
                [styles.cellFillingBottomBoundary]: this.state.isBottomFilling,
            });

        let cellStyle: JSXInternal.CSSProperties = {
            ...this.props.style,
        };
        if (this.options.cellStyle) {
            cellStyle = Object.assign({}, cellStyle, this.options.cellStyle);
        }
        // set style for a particular cell.
        if (this.options.getCellStyle) {
            cellStyle = Object.assign({}, cellStyle, this.options.getCellStyle(cellClassParam));
        }

        if (this.options.flex) {
            cellStyle.flexGrow = this.options.flex;
        }

        const fillable = this.state.fillable !== undefined
            && this.state.isBottomSelected
            && this.state.isRightSelected;

        let rowResizable = this.grid.state('grid').rowResizable;
        if (typeof rowResizable === 'function') {
            rowResizable = rowResizable(this.props.row);
        }

        return (
            <div
                ref={node => this.cell = node}
                className={className}
                style={cellStyle}
            >
                {dragable && (
                    <div ref={node => this.dragHandle = node} className={styles.cellDragHandle}>
                        <span className="vg-move"></span>
                    </div>
                )}
                <div ref={this.cellContent} className={styles.cellContent}></div>
                {!!rowResizable && (
                    <div
                        ref={node => this.resizer = node}
                        className={styles.rowResizeHolder}
                    />
                )}
                {fillable && (
                    <div
                        ref={node => this.filler = node}
                        className={styles.cellFillHandler}
                    />
                )}
            </div>
        );
    }
}

export default withGrid(Cell);
