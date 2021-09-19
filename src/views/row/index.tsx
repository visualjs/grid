import Component from "@/views/PureComponent";
import Cell from '@/views/cell';
import { Grid } from "@/grid";
import { classes, DOM } from '@/utils';
import { withGrid } from "@/views/root";
import { createRef, RefObject } from "preact";

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

            const hovered = this.props.grid.state('row').hoveredRow === this.props.value;
            const selected = this.props.grid.state('row').selectedRows.indexOf(this.props.value) !== -1;

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

        const style = {
            height: this.props.baseHeight,
            minHeight: this.props.baseHeight,
        }

        const index = this.props.grid.store('row').getRowIndex(this.props.value);

        const className = classes({
            [styles.rowCells]: true,
            [styles.rowStripeCells]: index % 2 === 0,
        })

        return (
            <div ref={this.self} className={className} style={style}>
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
