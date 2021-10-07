import Component from "@/views/PureComponent";
import Cell from '@/views/cell';
import { Grid } from "@/grid";
import { classes, DOM } from '@/utils';
import { withGrid } from "@/views/root";
import { createRef, RefObject } from "preact";
import { JSXInternal } from "preact/src/jsx";

import styles from './row.module.css';

interface Props {
    value: string;
    columns: string[];
    onCellDbClick?: (ev: MouseEvent, row: string, col: string) => void;
    onCellMouseDown?: (ev: MouseEvent, row: string, col: string) => void;
    onCellMouseMove?: (ev: MouseEvent, row: string, col: string) => void;
    onCellMouseUp?: (ev: MouseEvent, row: string, col: string) => void;
    onCellFillerMouseDown?: (ev: MouseEvent, row: string, col: string) => void;
    baseHeight: number;
    grid: Grid;
}

class Row extends Component<Props> {

    protected unsubscribe: () => void;

    protected self: RefObject<HTMLDivElement> = createRef();

    componentDidMount() {
        this.unsubscribe = this.props.grid.store('row').subscribeAny(() => {

            if (!this.self.current) return;

            const index = this.props.grid.store('row').getRowIndex(this.props.value);
            const hovered = this.props.grid.state('row').hoveredRow === this.props.value;
            const selected = this.props.grid.state('row').selectedRows.indexOf(this.props.value) !== -1;
            
            if (index % 2 === 0) {
                DOM.appendClassName(this.self.current, styles.rowStripeCells);
            } else {
                DOM.removeClassName(this.self.current, styles.rowStripeCells);
            }

            if (hovered) {
                DOM.appendClassName(this.self.current, styles.rowCellsHover);
            } else {
                DOM.removeClassName(this.self.current, styles.rowCellsHover);
            }

            if (selected) {
                DOM.appendClassName(this.self.current, styles.rowCellsSelect);
            } else {
                DOM.removeClassName(this.self.current, styles.rowCellsSelect);
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {

        const rowClassParams = {row: this.props.value, grid: this.props.grid};
        const index = this.props.grid.store('row').getRowIndex(this.props.value);

        let style: JSXInternal.CSSProperties = this.props.grid.state('row').rowStyle || {};
        style.height = this.props.baseHeight;
        style.minHeight = this.props.baseHeight;
        // set style for each row individually
        if (this.props.grid.state('row').getRowStyle) {
            style = Object.assign({}, style, this.props.grid.state('row').getRowStyle(rowClassParams))
        }

        let classNames = this.props.grid.state('row').rowClass || [];
        classNames.push(styles.rowCells);
        if (index % 2 === 0) {
            classNames.push(styles.rowStripeCells);
        }
        // set class(es) for each row individually.
        if (this.props.grid.state('row').getRowClass) {
            classNames = classNames.concat(this.props.grid.state('row').getRowClass(rowClassParams));
        }

        return (
            <div ref={this.self} className={classes(classNames)} style={style}>
                {
                    this.props.columns.map((col) => {
                        return (
                            <Cell
                                key={col}
                                row={this.props.value}
                                column={col}
                                onDbClick={this.props.onCellDbClick}
                                onMouseDown={this.props.onCellMouseDown}
                                onMouseMove={this.props.onCellMouseMove}
                                onMouseUp={this.props.onCellMouseUp}
                                onFillerMouseDown={this.props.onCellFillerMouseDown}
                            />
                        )
                    })
                }
            </div>
        );
    }

}

export default withGrid(Row);
