import GridElement from "@/grid/GridElement";
import Column from '@/grid/column';
import { classes } from "@/utils";
import List from '@/list';
import Body from './Body';

import styles from './grid.module.css';

interface GridProps {
    width?: string;
    height?: string;
    headerHeight?: number;
    preloadRowCount?: number;
}

interface RootState {
    headerPadding?: number;
    // horizontal scroll
    horizontalScrollLeft?: number;
    horizontalScrollHeight?: number;
    horizontalScrollWidth?: number;
    horizontalLeftSpacer?: number;
    horizontalRightSpacer?: number;
}

interface ResizingColumn {
    field: string;
    width: number;
    pos: number;
}

class GridRoot extends GridElement<GridProps, RootState> {

    protected resizingColumn: ResizingColumn;

    public componentDidMount = () => {
        this.resize();

        this.grid.addListener('columnOptionsChanged', () => {
            this.setState({}, this.resize);
        });
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

        this.setState({
            headerPadding: spacerX,
            horizontalScrollHeight: horizontalScrollHeight,
            horizontalScrollWidth: this.refs.headerContainer?.current?.scrollWidth || 0,
            horizontalLeftSpacer: this.refs.pinnedLeftColumns?.current?.offsetWidth || 0,
            horizontalRightSpacer: (this.refs.pinnedRightColumns?.current?.offsetWidth || 0) + spacerX,
        })
    }

    /**
     * Event handlers
     */

    protected handleColumnResizeStart = (field: string, width: number, ev: MouseEvent) => {
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
            const minWidth = this.grid.getColumnOptions(this.resizingColumn.field).minWidth

            this.grid.trigger('columnWidthChanged', {
                field: this.resizingColumn.field, width: Math.max(width, minWidth)
            });

            setTimeout(() => {
                this.resize();
            }, 0);
        }
    }

    protected handleMouseMove = (ev: MouseEvent) => {
        const offsetX = ev.pageX - this.refs.root.current.offsetLeft;
        this.refs.columnResizer.current.style.left = offsetX + 'px';
    }

    protected handleHorizontalScroll = (ev: UIEvent) => {
        this.setState({
            horizontalScrollLeft: (ev.target as HTMLDivElement).scrollLeft
        })
    }

    protected listRender = (items: string[]) => {
        return (
            <Body
                grid={this.grid}
                items={items}
                horizontalScrollLeft={this.state.horizontalScrollLeft}
            />
        )
    }

    protected renderColumns = (columns: string[]) => {
        return columns.map(col => {
            return (
                <Column
                    key={col}
                    grid={this.grid}
                    onResize={this.handleColumnResizeStart}
                    {...this.grid.getColumnOptions(col)}
                />
            );
        })
    }

    public render() {

        const rootStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        const headerStyle = {
            height: this.props.headerHeight,
            minHeight: this.props.headerHeight,
            paddingRight: this.state.headerPadding,
        };

        const pinnedLeftColumns = this.grid.getPinnedLeftColumns();
        const pinnedRightColumns = this.grid.getPinnedRightColumns();
        const normalColumns = this.grid.getNormalColumns();

        return (
            <div ref={this.createRef("root")} className={styles.root} style={rootStyle}>
                {/* headers */}
                <div className={styles.header} style={headerStyle}>
                    {pinnedLeftColumns.length > 0 && (
                        <div ref={this.createRef("pinnedLeftColumns")} className={classes([styles.pinnedLeftColumns, styles.headerColumns])}>
                            {this.renderColumns(pinnedLeftColumns)}
                        </div>
                    )}
                    {normalColumns.length > 0 && (
                        <div ref={this.createRef("normalColumns")} className={styles.normalColumns}>
                            <div
                                ref={this.createRef("headerContainer")}
                                style={{ transform: `translateX(-${this.state.horizontalScrollLeft}px)` }}
                                className={classes([styles.headerContainer, styles.headerColumns])}
                            >
                                {this.renderColumns(normalColumns)}
                            </div>
                        </div>
                    )}
                    {pinnedRightColumns.length > 0 && (
                        <div ref={this.createRef("pinnedRightColumns")} className={classes([styles.pinnedRightColumns, styles.headerColumns])}>
                            {this.renderColumns(pinnedRightColumns)}
                        </div>
                    )}
                </div>
                {/* body */}
                <div className={styles.body}>
                    <List
                        ref={this.createRef("list")}
                        items={this.grid.getRowKeys()}
                        itemHeight={this.grid.getRowHeight()}
                        preLoadCount={this.props.preloadRowCount}
                        render={this.listRender}
                    />
                </div>
                {/* fake horizontal scroll bar */}
                <div style={{ height: this.state.horizontalScrollHeight }} className={styles.horizontalScroll}>
                    <div style={{ width: this.state.horizontalLeftSpacer }} className={styles.horizontalLeftSpacer}></div>
                    <div className={styles.horizontalScrollView} onScroll={this.handleHorizontalScroll}>
                        <div
                            style={{ width: this.state.horizontalScrollWidth }}
                            ref={this.createRef("horizontalScrollContainer")}
                            className={styles.horizontalScrollContainer}
                        ></div>
                    </div>
                    <div style={{ width: this.state.horizontalRightSpacer }} className={styles.horizontalRightSpacer}></div>
                </div>
                {/* hidden global elements like column resizer etc. */}
                <div ref={this.createRef("columnResizer")} className={styles.columnResizer}></div>
            </div>
        );
    }

}

export default GridRoot;
