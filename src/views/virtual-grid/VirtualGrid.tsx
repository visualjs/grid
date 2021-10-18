import { PureComponent } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import { Direction, offsetProp, positionProp, scrollEventProp, scrollNode } from ".";
import { Alignment, ScrollChangeReason } from "./constants";
import SizeAndPositionManager from "./SizeAndPositionManager";
import { RowInfo, CellInfo, ItemSize } from "./types";
import { throttle } from "./utils";
import {
    STYLE_INNER, STYLE_ITEM, STYLE_PINNED_ITEM,
    STYLE_PINNED_WRAPPER, STYLE_SCROLL_HORIZONTAL,
    STYLE_SCROLL_VERTICAL, STYLE_WRAPPER
} from "./styles";

const DEFAULT_THROTTLE_RATE = 1000 / 10;
const DEFAULT_THROTTLE_TIMEOUT = 1000 / 10;
const DEFAULT_OVERSCAN_ROW_COUNT = 3;
const DEFAULT_OVERSCAN_COLUMN_COUNT = 1;

interface StyleCache {
    [id: string]: JSXInternal.CSSProperties;
}

export interface Props {
    className?: string;
    style?: JSXInternal.CSSProperties;
    // rows
    rows: string[];
    rowHeight: ItemSize;
    // columns
    columns: string[];
    pinnedLeftColumns?: string[];
    pinnedRightColumns?: string[];
    columnWidth: ItemSize;
    pinnedLeftClassName?: string;
    pinnedRightClassName?: string;
    // performance tuning
    throttleRate?: number; // ms
    throttleTimeout?: number; // ms
    // overscan count
    overscanColumnCount?: number;
    overscanRowCount?: number;
    // scroll offset
    scrollTopOffset?: number;
    scrollLeftOffset?: number;
    // scroll to
    scrollToColumnIndex?: number;
    scrollToColumnAlignment?: Alignment;
    scrollToRowIndex?: number;
    scrollToRowAlignment?: Alignment;
    // render
    renderRow(rowInfo: RowInfo): JSX.Element;
    renderCell(cellInfo: CellInfo): JSX.Element;
    // events
    onScrollHorizontal?: (ev: Event) => void;
    onScrollVertical?: (ev: Event) => void;
    // refs
    getScrollXNode?: (node: HTMLDivElement) => void;
    getScrollYNode?: (node: HTMLDivElement) => void;
}

export interface State {
    offsetLeft: number;
    offsetTop: number;
    scrollChangeReason: ScrollChangeReason;
}

export class VirtualGrid extends PureComponent<Props, State> {

    static defaultProps = {
        throttleRate: DEFAULT_THROTTLE_RATE,
        throttleTimeout: DEFAULT_THROTTLE_TIMEOUT,
        overscanRowCount: DEFAULT_OVERSCAN_ROW_COUNT,
        overscanColumnCount: DEFAULT_OVERSCAN_COLUMN_COUNT,
    };

    itemSizeGetter = (itemSize: ItemSize, keyer: (index: number) => string) => {
        return (index: number) => this.getSize(keyer(index), itemSize);
    };

    private rowManager = new SizeAndPositionManager({
        itemCount: this.props.rows.length,
        itemSizeGetter: this.itemSizeGetter(this.props.rowHeight, i => this.props.rows[i])
    });

    private columnManager = new SizeAndPositionManager({
        itemCount: this.props.columns.length,
        itemSizeGetter: this.itemSizeGetter(this.props.columnWidth, i => this.props.columns[i])
    });

    private onScrollVertical: (...args: any) => void;

    private onScrollHorizontal: (...args: any) => void;

    private rootNode?: HTMLElement;

    private scrollYNode?: HTMLElement;

    private scrollXNode?: HTMLElement;

    private rowStyleCache: StyleCache = {};

    private columnStyleCache: StyleCache = {};

    readonly state: State = {
        offsetLeft:
            this.props.scrollLeftOffset ||
            (this.props.scrollToColumnIndex != null &&
                this.getOffsetForColumn(this.props.scrollToColumnIndex)) ||
            0,
        offsetTop:
            this.props.scrollTopOffset ||
            (this.props.scrollToRowIndex != null &&
                this.getOffsetForRow(this.props.scrollToRowIndex)) ||
            0,
        scrollChangeReason: ScrollChangeReason.REQUESTED,
    };

    componentDidMount() {
        const {
            throttleRate = DEFAULT_THROTTLE_RATE,
            throttleTimeout = DEFAULT_THROTTLE_TIMEOUT,
            scrollLeftOffset, scrollToColumnIndex,
            scrollTopOffset, scrollToRowIndex,
        } = this.props;

        this.onScrollVertical = throttle(this.handleScroll, throttleTimeout, throttleRate, Direction.Vertical);
        // this.onScrollHorizontal = throttle(this.handleScroll, throttleTimeout, throttleRate, Direction.Horizontal);
        this.onScrollHorizontal = (ev: Event) => this.handleScroll(ev, Direction.Horizontal);
        this.scrollYNode?.addEventListener('scroll', this.onScrollVertical, { passive: true });
        this.scrollXNode?.addEventListener('scroll', this.onScrollHorizontal, { passive: true });

        let scrollLeft = undefined;
        let scrollTop = undefined;

        if (scrollLeftOffset != undefined) {
            scrollLeft = scrollLeftOffset;
        } else if (scrollToColumnIndex != undefined) {
            scrollLeft = this.getOffsetForColumn(scrollToColumnIndex);
        }

        if (scrollTopOffset != undefined) {
            scrollTop = scrollTopOffset;
        } else if (scrollToRowIndex != undefined) {
            scrollTop = this.getOffsetForRow(scrollToRowIndex);
        }

        this.scrollTo({ left: scrollLeft, top: scrollTop });
        this.forceUpdate();
    }

    componentWillReceiveProps(nextProps: Props) {

        const {
            rows,
            columns,
            rowHeight,
            columnWidth,
            scrollTopOffset,
            scrollLeftOffset,
            scrollToRowAlignment,
            scrollToColumnAlignment,
            scrollToRowIndex,
            scrollToColumnIndex,
        } = this.props;

        const scrollPropsHaveChanged =
            nextProps.scrollToRowIndex !== scrollToRowIndex ||
            nextProps.scrollToColumnIndex !== scrollToColumnIndex ||
            nextProps.scrollToRowAlignment !== scrollToRowAlignment ||
            nextProps.scrollToColumnAlignment !== scrollToColumnAlignment;
        const itemPropsHaveChanged =
            nextProps.rows !== rows ||
            nextProps.columns !== columns ||
            nextProps.rowHeight !== rowHeight ||
            nextProps.columnWidth !== columnWidth;

        if (nextProps.rowHeight !== rowHeight) {
            this.rowManager.updateConfig({
                itemSizeGetter: this.itemSizeGetter(nextProps.rowHeight, i => this.props.rows[i]),
            });
        }

        if (nextProps.columnWidth !== columnWidth) {
            this.columnManager.updateConfig({
                itemSizeGetter: this.itemSizeGetter(nextProps.columnWidth, i => this.props.columns[i]),
            });
        }

        if (nextProps.rows !== rows) {
            this.rowManager.updateConfig({
                itemCount: nextProps.rows.length
            });
        }

        if (nextProps.columns !== columns) {
            this.columnManager.updateConfig({
                itemCount: nextProps.columns.length
            });
        }

        if (itemPropsHaveChanged) {
            this.recomputeSizes();
        }

        if (
            nextProps.scrollLeftOffset !== scrollLeftOffset ||
            nextProps.scrollTopOffset != scrollTopOffset
        ) {
            this.setState({
                offsetLeft: nextProps.scrollLeftOffset || 0,
                offsetTop: nextProps.scrollTopOffset || 0,
                scrollChangeReason: ScrollChangeReason.REQUESTED,
            });
        } else if (scrollPropsHaveChanged || itemPropsHaveChanged) {
            this.setState({
                offsetLeft: this.getOffsetForColumn(
                    nextProps.scrollToColumnIndex || 0,
                    nextProps.scrollToColumnAlignment,
                    nextProps.columns.length,
                ),
                offsetTop: this.getOffsetForRow(
                    nextProps.scrollToRowIndex || 0,
                    nextProps.scrollToRowAlignment,
                    nextProps.rows.length,
                ),
                scrollChangeReason: ScrollChangeReason.REQUESTED,
            });
        }
    }

    componentDidUpdate(_: Props, prevState: State) {

        // hide horizontal scroll bar
        const parent = this.scrollXNode.parentNode as HTMLDivElement;
        const spacerY = this.scrollXNode.offsetHeight - this.scrollXNode.clientHeight;
        this.scrollXNode.style.height = parent.offsetHeight + spacerY + 'px';

        // update offset
        const { offsetLeft, offsetTop, scrollChangeReason } = this.state;

        if (
            (
                prevState.offsetLeft !== offsetLeft ||
                prevState.offsetTop != offsetTop
            ) && scrollChangeReason === ScrollChangeReason.REQUESTED
        ) {
            this.scrollTo({ left: offsetLeft, top: offsetTop });
        }
    }

    componentWillUnmount() {
        this.scrollYNode?.removeEventListener('scroll', this.onScrollVertical);
        this.scrollXNode?.removeEventListener('scroll', this.onScrollHorizontal);
    }

    scrollTo({ top, left }: { top?: number, left?: number }) {
        if (top != undefined && this.scrollYNode) {
            this.scrollYNode.scrollTop = top;
        }

        if (left != undefined && this.scrollXNode) {
            this.scrollXNode.scrollLeft = left;
        }
    }

    getOffsetForColumn(
        index: number,
        scrollToAlignment = this.props.scrollToColumnAlignment,
        itemCount: number = this.props.columns.length,
    ): number {
        if (index < 0 || index >= itemCount) {
            index = 0;
        }

        return this.columnManager.getUpdatedOffsetForIndex({
            align: scrollToAlignment,
            containerSize: this.scrollXNode?.offsetWidth || 0,
            currentOffset: (this.state && this.state.offsetLeft) || 0,
            targetIndex: index,
        });
    }

    getOffsetForRow(
        index: number,
        scrollToAlignment = this.props.scrollToRowAlignment,
        itemCount: number = this.props.rows.length,
    ): number {
        if (index < 0 || index >= itemCount) {
            index = 0;
        }

        return this.rowManager.getUpdatedOffsetForIndex({
            align: scrollToAlignment,
            containerSize: this.rootNode?.offsetHeight || 0,
            currentOffset: (this.state && this.state.offsetTop) || 0,
            targetIndex: index,
        });
    }

    recomputeSizes(startRowIndex = 0, startColumnIndex = 0) {
        this.rowStyleCache = {};
        this.columnStyleCache = {};
        this.rowManager.resetItem(startRowIndex);
        this.columnManager.resetItem(startColumnIndex);
    }

    private getSize(id: string, itemSize: ItemSize): number {
        if (typeof itemSize === 'function') {
            return itemSize(id);
        }

        return (typeof itemSize === 'number') ? itemSize : itemSize[id];
    }

    private getRowStyle(index: number) {
        const id = this.props.rows[index];
        const style = this.rowStyleCache[id];

        if (style) {
            return style;
        }

        const { size, offset } = this.rowManager.getSizeAndPositionForIndex(index);
        return (this.rowStyleCache[id] = { ...STYLE_ITEM, height: size, transform: `translateY(${offset}px)` });
    }

    private getColumnStyle(index: number) {

        const id = this.props.columns[index];
        const style = this.columnStyleCache[id];
        if (style) {
            return style;
        }

        const { size, offset } = this.columnManager.getSizeAndPositionForIndex(index);
        return (this.columnStyleCache[id] = { ...STYLE_ITEM, width: size, left: offset });
    }

    private getPinnedColumnStyle(id: string) {
        const style = this.columnStyleCache[id];
        if (style) {
            return style;
        }

        const width = this.getSize(id, this.props.columnWidth);
        return (this.columnStyleCache[id] = { ...STYLE_PINNED_ITEM, width });
    }

    private handleScroll = (ev: Event, direction: Direction) => {

        if (typeof this.props[scrollEventProp[direction]] === 'function') {
            (this.props[scrollEventProp[direction]])(ev);
        }

        const offset = this.getNodeOffset();

        if (
            offset[positionProp[direction]] < 0 ||
            ev.target !== this[scrollNode[direction]] ||
            this.state[offsetProp[direction]] === offset[positionProp[direction]]
        ) {
            return;
        }

        this.setState({
            [offsetProp[direction]]: offset[positionProp[direction]],
            scrollChangeReason: ScrollChangeReason.OBSERVED,
        });
    }

    private getNodeOffset() {
        return {
            top: this.scrollYNode?.scrollTop || 0,
            left: this.scrollXNode?.scrollLeft || 0
        };
    }

    private getRootRef = (node: HTMLDivElement): void => {
        this.rootNode = node;
    }

    private getScrollYRef = (node: HTMLDivElement): void => {
        this.scrollYNode = node;
        this.props.getScrollYNode && this.props.getScrollYNode(node);
    };

    private getScrollXRef = (node: HTMLDivElement): void => {
        this.scrollXNode = node;
        this.props.getScrollXNode && this.props.getScrollXNode(node);
    };

    private getPinnedLeftWidth = () => {
        return this.props.pinnedLeftColumns.reduce((total, column) => {
            return total + this.getSize(column, this.props.columnWidth);
        }, 0);
    }

    private getPinnedRightWidth = () => {
        return this.props.pinnedRightColumns.reduce((total, column) => {
            return total + this.getSize(column, this.props.columnWidth);
        }, 0);
    }

    render() {

        const {
            style,
            pinnedLeftColumns = [],
            pinnedRightColumns = [],
            overscanRowCount = DEFAULT_OVERSCAN_ROW_COUNT,
            overscanColumnCount = DEFAULT_OVERSCAN_COLUMN_COUNT,
            renderRow,
            renderCell,
        } = this.props;

        const props = {
            className: this.props.className,
            children: this.props.children,
        };

        const { offsetLeft, offsetTop } = this.state;

        const rowRange = this.rowManager.getVisibleRange({
            containerSize: this.rootNode?.offsetHeight || 0,
            offset: offsetTop,
            overscanCount: overscanRowCount
        });

        const columnRange = this.columnManager.getVisibleRange({
            containerSize: this.scrollXNode?.offsetWidth || 0,
            offset: offsetLeft,
            overscanCount: overscanColumnCount,
        });

        const totalWidth = this.columnManager.getTotalSize();
        const totalHeight = this.rowManager.getTotalSize();
        const pinnedLeftWidth = this.getPinnedLeftWidth();
        const pinnedRightWidth = this.getPinnedRightWidth();

        const rows: JSX.Element[] = [];
        const pinnedLeftRows: JSX.Element[] = [];
        const pinnedRightRows: JSX.Element[] = [];

        if (rowRange.start != undefined && rowRange.stop != undefined) {
            for (let rowIndex = rowRange.start; rowIndex <= rowRange.stop; rowIndex++) {
                const row = this.props.rows[rowIndex];
                const cells: JSX.Element[] = [];

                // render pinned left cells in a row
                const pinnedLeftCells = pinnedLeftColumns.map(column => {
                    return renderCell({ style: this.getPinnedColumnStyle(column), column, row });
                });

                // render pinned right cells in a row
                const pinnedRigtCells = pinnedRightColumns.map(column => {
                    return renderCell({ style: this.getPinnedColumnStyle(column), column, row });
                });

                // render normal cells in a row
                if (columnRange.start != undefined && columnRange.stop != undefined) {
                    for (let columnIndex = columnRange.start; columnIndex <= columnRange.stop; columnIndex++) {
                        const column = this.props.columns[columnIndex];
                        cells.push(renderCell({ style: this.getColumnStyle(columnIndex), row, column }));
                    }
                }

                const rowStyle = this.getRowStyle(rowIndex);

                if (pinnedLeftCells.length > 0) {
                    pinnedLeftRows.push(renderRow({ style: { ...rowStyle, display: 'flex' }, row, cells: pinnedLeftCells }));
                }
                if (pinnedRigtCells.length > 0) {
                    pinnedRightRows.push(renderRow({ style: { ...rowStyle, display: 'flex' }, row, cells: pinnedRigtCells }));
                }
                rows.push(renderRow({ style: rowStyle, row, cells }));
            }
        }

        return (
            <div ref={this.getRootRef} {...props} style={{ ...STYLE_WRAPPER, ...style }}>
                <div ref={this.getScrollYRef} style={STYLE_SCROLL_VERTICAL}>
                    {
                        // pinned left columns
                        pinnedLeftRows.length > 0 && (
                            <div
                                className={this.props.pinnedLeftClassName}
                                style={{ ...STYLE_PINNED_WRAPPER, width: pinnedLeftWidth, height: totalHeight }}
                            >
                                {pinnedLeftRows}
                            </div>
                        )
                    }
                    {/* scroll x area */}
                    <div style={{ ...STYLE_SCROLL_HORIZONTAL, overflow: 'hidden', height: totalHeight }}>
                        <div ref={this.getScrollXRef} style={{ ...STYLE_SCROLL_HORIZONTAL, height: totalHeight + 17 }}>
                            <div style={{ ...STYLE_INNER, width: totalWidth }}>
                                {rows}
                            </div>
                        </div>
                    </div>
                    {
                        // pinned right columns
                        pinnedRightRows.length > 0 && (
                            <div
                                className={this.props.pinnedRightClassName}
                                style={{ ...STYLE_PINNED_WRAPPER, width: pinnedRightWidth, height: totalHeight }}
                            >
                                {pinnedRightRows}
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}
