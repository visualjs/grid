import Component from "@/views/PureComponent";
import { createRef } from "preact";
import { Grid, State as RootState } from "@/grid";
import { connect } from "@/views/root";
import { ColumnOptions, Fillable } from "@/types";
import { classes, DOM } from "@/utils";
import { withGrid } from "@/views/root";
import { CellEditor } from "@/grid/cell";

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

    protected isEditing: boolean = false;

    protected editor: CellEditor<any>;

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
            if (this.editor) {
                DOM.setClassNames(this.cellContent.current, [styles.cellContent]);
                this.setValue(this.editor.getValue());
                this.doRender();
            }
            return;
        }


        const popup = document.createElement('div');
        DOM.clean(this.cellContent.current);
        DOM.appendClassName(this.cellContent.current, styles.cellEditing);

        if (!this.editor) {
            this.editor = new this.options.cellEditor();
        }

        if (this.editor.isPopup()) {
            popup.className = `${styles.cellEditingWrapper} ${styles.cellEditingPopup}`;
        } else {
            popup.className = styles.cellEditingWrapper;
        }

        this.editor.init && this.editor.init({
            props: this.options.cellParams,
            value: this.getValue(true),
            column: this.options,
            row: this.props.row,
            gird: this.props.grid,
        });

        popup.appendChild(this.editor.gui());
        this.cellContent.current.appendChild(popup);
        this.editor.afterAttached && this.editor.afterAttached();
    }

    // render cell component
    protected doRender() {
        if (this.isEditing) return;

        this.timer = setTimeout(() => {
            if (this.props.options.cellRender) {
                const render = new this.props.options.cellRender();
                render.init && render.init({
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

                DOM.clean(this.cellContent.current);
                this.cellContent.current.appendChild(render.gui());
                render.afterAttached && render.afterAttached();
            } else {
                this.cellContent.current && (this.cellContent.current.textContent = this.getValue());
            }
        }, 0);
    }

    render() {

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

        const cellStyle: { [key: string]: any } = {
            width: this.options.width
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
                className={className}
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
