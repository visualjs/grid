import Component from "@/views/PureComponent";
import { createRef } from "preact";
import { Grid, State as RootState } from "@/grid";
import { connect } from "@/views/root";
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
    rawValue: any;
    options: ColumnOptions;
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
    onDbClick?: (ev: MouseEvent, row: string, col: string) => void;
    onMouseDown?: (ev: MouseEvent, row: string, col: string) => void;
    onMouseMove?: (ev: MouseEvent, row: string, col: string) => void;
    onMouseUp?: (ev: MouseEvent, row: string, col: string) => void;
    onFillerMouseDown?: (ev: MouseEvent, row: string, col: string) => void;
}

class Cell extends Component<Props> {

    protected cell = createRef<HTMLDivElement>();

    protected cellContent = createRef<HTMLDivElement>();

    protected popup: HTMLDivElement = null;

    protected isEditing: boolean = false;

    protected cellEditor: CellEditor<any>;

    protected cellRender: CellRenderer<any>;

    protected timer: any = null;

    protected io: IntersectionObserver;

    protected unsubscribeEditing: () => void;

    get options() {
        return this.props.options;
    }

    constructor(props: Props) {
        super(props);

        this.io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.doRender();
                this.io.disconnect();
            }
        }, { threshold: 0.000001 })
    }

    componentDidMount = () => {
        this.io.observe(this.cell.current);
        if (!this.options.cellEditor || this.options.readonly) {
            return;
        }

        this.unsubscribeEditing = this.props.grid.store('cell').subscribeAny(() => {
            const pos = this.props.grid.state('cell').editing;
            const shouldEditing = Boolean(pos && pos.row === this.props.row && pos.column === this.props.column);

            if (this.isEditing !== shouldEditing) {
                this.isEditing = shouldEditing;
                this.handleCellEditing();
            }
        });
    }

    componentWillUnmount = () => {
        this.unsubscribeEditing && this.unsubscribeEditing();
        this.props.grid.removeChild(this.popup);

        // clean cell render and cell editor
        if (this.cellRender && this.cellRender.beforeDestroy) {
            this.cellRender.beforeDestroy();
        }
        if (this.cellEditor && this.cellEditor.beforeDestroy) {
            this.cellEditor.beforeDestroy();
        }

        this.io.disconnect();
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    componentDidUpdate = () => {
        this.doRender();
    }

    // Event handlers
    protected handleMouseDown = (ev: MouseEvent) => {
        if (this.isEditing) return;
        this.props.onMouseDown && this.props.onMouseDown(ev, this.props.row, this.props.column);
    }

    protected handleMouseMove = (ev: MouseEvent) => {
        if (this.isEditing) return;
        this.props.onMouseMove && this.props.onMouseMove(ev, this.props.row, this.props.column);
    }

    protected handleMouseUp = (ev: MouseEvent) => {
        if (this.isEditing) return;
        this.props.onMouseUp && this.props.onMouseUp(ev, this.props.row, this.props.column);
    }

    protected handleDbClick = (ev: MouseEvent) => {
        this.props.onDbClick && this.props.onDbClick(ev, this.props.row, this.props.column);
    }

    protected handleFillerMouseDown = (ev: MouseEvent) => {
        ev.stopPropagation();
        this.props.onFillerMouseDown && this.props.onFillerMouseDown(ev, this.props.row, this.props.column);
    }

    // Actions
    protected getValue(raw: boolean = false): any {
        if (raw) {
            return this.props.rawValue;
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
        const rect = this.cell.current.getBoundingClientRect();

        this.popup.style.left = rect.left - rootRect.left + 'px';
        this.popup.style.top = rect.top - rootRect.top + 'px';
        this.popup.appendChild(editor);
        this.props.grid.appendChild(this.popup);
    }

    // render cell component
    protected doRender() {
        if (this.isEditing) return;

        this.timer = setTimeout(() => {
            if (!this.props.options.cellRender) {
                this.cellContent.current && (this.cellContent.current.textContent = this.getValue());
                return;
            }

            // clean up the cell render before.
            if (this.cellRender && this.cellRender.beforeDestroy) {
                this.cellRender.beforeDestroy();
            }

            this.cellRender = new this.props.options.cellRender();
            this.cellRender.init && this.cellRender.init({
                props: this.props.options.cellParams,
                value: this.getValue(true),
                column: this.props.options,
                row: this.props.row,
                gird: this.props.grid,
            });

            this.timer = null;

            if (!this.cellContent.current) {
                return;
            }

            this.props.grid.removeChild(this.popup);
            DOM.clean(this.cellContent.current);
            this.cellContent.current.appendChild(this.cellRender.gui());
            this.cellRender.afterAttached && this.cellRender.afterAttached();
        }, 0);
    }

    render() {
        const cellClassParam = { column: this.props.column, row: this.props.row, grid: this.props.grid };

        let cellClassNames = this.props.options.cellClass || [];
        // set class(es) for a particular cell.
        if (this.props.options.getCellClass) {
            cellClassNames = cellClassNames.concat(this.props.options.getCellClass(cellClassParam));
        }

        const className = classes({
            [styles.cell]: true,
            [styles.cellSelected]: this.props.isSelected,
            [styles.cellLeftBoundary]: this.props.isLeftSelected,
            [styles.cellRightBoundary]: this.props.isRightSelected,
            [styles.cellTopBoundary]: this.props.isTopSelected,
            [styles.cellBottomBoundary]: this.props.isBottomSelected,
            [styles.cellFilling]: this.props.isFilling,
            [styles.cellFillingLeftBoundary]: this.props.isLeftFilling,
            [styles.cellFillingRightBoundary]: this.props.isRightFilling,
            [styles.cellFillingTopBoundary]: this.props.isTopFilling,
            [styles.cellFillingBottomBoundary]: this.props.isBottomFilling,
        });

        let cellStyle: JSXInternal.CSSProperties = {
            width: this.options.width,
            minWidth: this.options.minWidth
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

        const fillable = this.props.fillable !== undefined
            && this.props.isBottomSelected
            && this.props.isRightSelected;

        return (
            <div
                ref={this.cell}
                className={className + ' ' + classes(cellClassNames)}
                style={cellStyle}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onDblClick={this.handleDbClick}
            >
                <div ref={this.cellContent} className={styles.cellContent}></div>
                {fillable && (
                    <div
                        onMouseDown={this.handleFillerMouseDown}
                        className={styles.cellFillHandler}
                    />
                )}
            </div>
        );
    }

}

const mapStateToProps = (state: RootState, { grid, props }: { grid: Grid, props: Props }) => {

    const options = grid.getColumnOptions(props.column, props.row);
    const readonly = options?.readonly;
    const selectBoundary = readonly ? undefined : grid.getSelectBoundary(props.row, props.column);
    const fillingBoundary = readonly ? undefined : grid.getFillingBoundary(props.row, props.column);

    return {
        rawValue: grid.getRawCellValue(props.row, props.column),
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
        options: options,
        fillable: state.grid.fillable,
    };
};

export default connect(mapStateToProps)(withGrid(Cell));
