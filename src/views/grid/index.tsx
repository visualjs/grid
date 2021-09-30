import Component from "@/views/Component";
import { connect, withGrid } from "@/views/root";
import { State as RootState, Grid as GridApi } from "@/grid";
import { ColumnOptions } from "@/types";
import Header from '@/views/header';
import Body from "./Body";

import styles from './grid.module.css';

interface Props {
    grid: GridApi;
    // grid
    loading: boolean;
    width: string;
    height: string;
    // rows
    normalRows: string[];
    pinnedTopRows: string[];
    pinnedBottomRows: string[];
}

interface ResizingColumn {
    field: string;
    width: number;
    pos: number;
}

class Grid extends Component<Props> {

    protected resizingColumn: ResizingColumn;

    protected unsubscribes: (() => void)[] = [];

    protected ignoreScrollEvents = false;

    public componentDidMount = () => {

        this.unsubscribes.push(this.props.grid.getRoot().subscribeAny(() => {
            this.resize();
        }));

        this.resize();
    }

    public componentWillUnmount = () => {
        this.unsubscribes.forEach(f => f());
    }

    public resize() {
        // If a vertical scroll bar appears, the last column will be misaligned
        // a spacer needs to be added
        const list = (this.refs.list.current as any).base;
        const spacerX = list.offsetWidth - list.clientWidth;

        // fake horizontal scrollbar
        let horizontalScrollHeight = 0;
        if (this.refs.headerContainer.current.scrollWidth > this.refs.normalColumns.current.clientWidth) {
            // we need to show a horizontal scrollbar
            horizontalScrollHeight = this.refs.horizontalScrollContainer.current.offsetHeight;
        }

        const contentWidth = (this.refs.headerContainer?.current?.scrollWidth || 0);

        this.refs.header.current.style.paddingRight = spacerX + 'px';
        this.refs.horizontalScrollWrapper.current.style.height = horizontalScrollHeight + 'px';
        // rows and pinned rows
        this.refs.normalCellsContainer.current.style.width = contentWidth + 'px';
        this.refs.pinnedTopNormalCellsContainer.current.style.width = contentWidth + 'px';
        this.refs.pinnedTopRows.current.style.paddingRight = spacerX + 'px';
        this.refs.pinnedBottomNormalCellsContainer.current.style.width = contentWidth + 'px';
        this.refs.pinnedBottomRows.current.style.paddingRight = spacerX + 'px';
        // horizontal scrollbar
        this.refs.horizontalScrollContainer.current.style.width = contentWidth + 'px';
        this.refs.horizontalLeftSpacer.current.style.width = (this.refs.pinnedLeftColumns?.current?.scrollWidth || 0) + 'px';
        this.refs.horizontalRightSpacer.current.style.width = (this.refs.pinnedRightColumns?.current?.offsetWidth || 0) + spacerX + 'px';
    }

    /**
     * Actions
     */

    protected getColumnOptions = (column: string): ColumnOptions => {
        return this.props.grid.getColumnOptions(column);
    }

    /**
     * Event handlers
     */

    protected handleColumnResizeStart = (field: string, width: number, ev: MouseEvent) => {
        if (this.props.grid.trigger('beforeColumnResizing', field, width) === false) {
            return;
        }

        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);

        const offsetX = ev.pageX - this.refs.root.current.offsetLeft;
        this.refs.columnResizer.current.style.left = offsetX + 'px';
        this.refs.columnResizer.current.style.width = '2px';
        this.resizingColumn = { field, width, pos: ev.clientX };
    }

    protected handleMouseUp = (ev: MouseEvent) => {
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.refs.columnResizer.current.style.left = '0px';
        this.refs.columnResizer.current.style.width = '0px';

        if (this.resizingColumn) {
            const width = ev.clientX - this.resizingColumn.pos + this.resizingColumn.width;
            const minWidth = this.getColumnOptions(this.resizingColumn.field).minWidth;
            const param = {
                field: this.resizingColumn.field,
                width: Math.max(width, minWidth)
            };

            this.props.grid.store('column').dispatch('updateColumnWidth', param);
            this.props.grid.trigger('afterColumnResizing', param.field, param.width);
        }
    }

    protected handleMouseMove = (ev: MouseEvent) => {
        const offsetX = ev.pageX - this.refs.root.current.offsetLeft;
        this.refs.columnResizer.current.style.left = offsetX + 'px';
    }

    protected handleHorizontalScroll = (ev: UIEvent) => {

        // Prevent the horizontal scroll bar from flickering when scrolling
        if (this.ignoreScrollEvents) return;
        this.ignoreScrollEvents = true;

        const update = () => {
            const scrollLeft = (ev.target as HTMLDivElement).scrollLeft;
            this.refs.normalCells.current.scrollLeft = scrollLeft;
            this.refs.pinnedTopNormalCells.current.scrollLeft = scrollLeft;
            this.refs.pinnedBottomNormalCells.current.scrollLeft = scrollLeft;
            this.refs.horizontalScroll.current.scrollLeft = scrollLeft;
            this.refs.headerContainer.current.style.transform = `translateX(-${scrollLeft}px)`;

            requestAnimationFrame(() => {
                this.ignoreScrollEvents = false;
            });
        };

        if (ev.target == this.refs.horizontalScroll.current) {
            requestAnimationFrame(update);
        } else {
            update();
        }
    }

    render() {

        const rootStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        return (
            <div ref={this.createRef("root")} className={styles.root} style={rootStyle}>
                <Header
                    headerRef={this.createRef("header")}
                    headerContainerRef={this.createRef("headerContainer")}
                    normalColumnsRef={this.createRef("normalColumns")}
                    pinnedLeftColumnsRef={this.createRef("pinnedLeftColumns")}
                    pinnedRightColumnsRef={this.createRef("pinnedRightColumns")}
                    handleColumnResizeStart={this.handleColumnResizeStart}
                />
                <Body
                    pinnedTopRows={this.props.pinnedTopRows}
                    pinnedBottomRows={this.props.pinnedBottomRows}
                    normalRows={this.props.normalRows}
                    onHorizontalScroll={this.handleHorizontalScroll}
                    // refs
                    listRef={this.createRef("list")}
                    normalCellsContainerRef={this.createRef("normalCellsContainer")}
                    normalCellsRef={this.createRef("normalCells")}
                    pinnedTopRowsRef={this.createRef("pinnedTopRows")}
                    pinnedTopNormalCellsContainerRef={this.createRef("pinnedTopNormalCellsContainer")}
                    pinnedTopNormalCellsRef={this.createRef("pinnedTopNormalCells")}
                    pinnedBottomRowsRef={this.createRef("pinnedBottomRows")}
                    pinnedBottomNormalCellsContainerRef={this.createRef("pinnedBottomNormalCellsContainer")}
                    pinnedBottomNormalCellsRef={this.createRef("pinnedBottomNormalCells")}
                />
                {/* fake horizontal scroll bar */}
                <div ref={this.createRef("horizontalScrollWrapper")} className={styles.horizontalScroll}>
                    <div ref={this.createRef("horizontalLeftSpacer")} className={styles.horizontalLeftSpacer}></div>
                    <div ref={this.createRef("horizontalScroll")} className={styles.horizontalScrollView} onScroll={this.handleHorizontalScroll}>
                        <div
                            ref={this.createRef("horizontalScrollContainer")}
                            className={styles.horizontalScrollContainer}
                        ></div>
                    </div>
                    <div ref={this.createRef("horizontalRightSpacer")} className={styles.horizontalRightSpacer}></div>
                </div>
                {/* hidden global elements like column resizer etc. */}
                <div ref={this.createRef("columnResizer")} className={styles.columnResizer}></div>
                {/* loading */}
                {
                    this.props.loading && <div className={styles.loading}>
                        <div className={styles.spinner}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        loading: state.grid.loading,
        width: state.grid.width,
        height: state.grid.height,
        normalRows: state.row.normalRows,
        pinnedTopRows: state.row.pinnedTopRows,
        pinnedBottomRows: state.row.pinnedBottomRows,
    };
};

export default connect(mapStateToProps)(withGrid(Grid));
