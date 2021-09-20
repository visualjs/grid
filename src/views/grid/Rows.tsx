import Component from "@/views/PureComponent";
import { Grid, State as RootState } from "@/grid";
import { connect } from "@/views/root";
import Row from '@/views/row';
import withGrid from "@/views/root/withGrid";
import { RefObject } from "preact";

import styles from './grid.module.css';

interface Props {
    grid: Grid;
    items: string[];
    // columns
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    // rows
    rowHeight: number;
    // refs
    selfRef?: RefObject<HTMLDivElement>;
    normalCellsRef: RefObject<HTMLDivElement>;
    normalCellsContainerRef: RefObject<HTMLDivElement>;
    // handlers
    handleHorizontalScroll: (ev: UIEvent) => void;
    // events
    onCellDbClick: (ev: MouseEvent, row: string, column: string) => void;
    onCellMouseDown: (ev: MouseEvent, row: string, column: string) => void;
    onCellMouseMove: (ev: MouseEvent, row: string, column: string) => void;
    onCellFillerMouseDown: (ev: MouseEvent, row: string, column: string) => void;
}

class Rows extends Component<Props> {

    componentDidUpdate = () => {
        this.refs.normalCellsWrapper.current.style.height = this.props.normalCellsRef.current.clientHeight + 'px';
    }

    // copy and paste
    protected handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'c' && (ev.ctrlKey || ev.metaKey)) {
            return this.props.grid.copySelection();
        }

        if (ev.key === 'v' && (ev.ctrlKey || ev.metaKey)) {
            return this.props.grid.pasteFromClipboard();
        }
    }

    /**
     * Renders
     */
    protected renderRows = (columns: string[]) => {
        return this.props.items.map(row => {
            return (
                <Row
                    key={row}
                    value={row}
                    baseHeight={this.props.rowHeight}
                    columns={columns}
                    onCellDbClick={this.props.onCellDbClick}
                    onCellMouseDown={this.props.onCellMouseDown}
                    onCellMouseMove={this.props.onCellMouseMove}
                    onCellFillerMouseDown={this.props.onCellFillerMouseDown}
                />
            )
        })
    }

    render() {

        return (
            <div
                ref={this.props.selfRef}
                onKeyDown={this.handleKeyDown}
                tabIndex={0}
                style={{ display: 'flex', outline: 'none', position: 'relative' }}
            >
                {this.props.pinnedLeftColumns.length > 0 && (
                    <div className={styles.pinnedLeftCells}>
                        {this.renderRows(this.props.pinnedLeftColumns)}
                    </div>
                )}
                <div ref={this.createRef('normalCellsWrapper')} className={styles.normalCells}>
                    <div
                        ref={this.props.normalCellsRef}
                        className={styles.normalCellsViewPort}
                        onScroll={this.props.handleHorizontalScroll}
                    >
                        <div
                            ref={this.props.normalCellsContainerRef}
                            className={styles.normalCellsContainer}
                        >
                            {this.renderRows(this.props.normalColumns)}
                        </div>
                    </div>
                </div>
                {this.props.pinnedRightColumns.length > 0 && (
                    <div className={styles.pinnedRightCells}>
                        {this.renderRows(this.props.pinnedRightColumns)}
                    </div>
                )}
            </div>
        );
    };
}

const mapStateToProps = (state: RootState) => {
    return {
        pinnedLeftColumns: state.column.pinnedLeftColumns,
        pinnedRightColumns: state.column.pinnedRightColumns,
        normalColumns: state.column.normalColumns,
        rowHeight: state.row.height,
    };
};

export default connect(mapStateToProps)(withGrid(Rows));
