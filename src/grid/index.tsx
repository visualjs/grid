import { GridOptions } from '@/types';
import Column, { ColumnProps } from '@/column';
import Cell from '@/cell';
import { Component, h, render } from '@/component';

import styles from './grid.module.css';

const defaultGridOptions = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    rowHeight: 28,
}

const defaultColumnOptions = {
    width: 200,
};

class Grid extends Component<GridOptions> {

    // save ordered column fields
    protected pinnedLeftColumns: string[] = [];

    protected pinnedRightColumns: string[] = [];

    protected normalColumns: string[] = [];

    // use the column field as the key, and the column option as the value
    protected columns: Record<string, ColumnProps> = {};

    constructor(props: GridOptions) {
        super(props);

        this.props = Object.assign({}, defaultGridOptions, props);

        this.props.columns.forEach(col => {
            col = Object.assign({}, defaultColumnOptions, col);
            
            if (col.pinned == 'left') {
                this.pinnedLeftColumns.push(col.field);
            } else if (col.pinned == 'right') {
                this.pinnedRightColumns.push(col.field);
            } else {
                this.normalColumns.push(col.field);
            }

            this.columns[col.field] = col;
        })

        this.doRender();
        this.resize();
    }

    protected doRender() {
        render(this.render(), this.props.container);
    }

    protected resize() {
        // If a vertical scroll bar appears, the last column will be misaligned
        // a spacer needs to be added
        const spacerX = this.refs.body.offsetWidth - this.refs.body.clientWidth;
        this.refs.header.style.paddingRight = spacerX + 'px';

        // Set the cell container height according to the content height
        const contentHeight = this.props.rows.length * this.props.rowHeight + 'px';
        this.refs.pinnedLeftCells.style.height = contentHeight;
        this.refs.normalCells.style.height = contentHeight;
        this.refs.pinnedRightCells.style.height = contentHeight;

        // fake horizontal scrollbar
        if (this.refs.headerContainer.scrollWidth > this.refs.normalCells.clientWidth) {
            // we need to show a horizontal scrollbar
            this.refs.horizontalScroll.style.height = this.refs.horizontalScrollContainer.offsetHeight + 'px';
        } else {
            this.refs.horizontalScroll.style.height = '0px';
        }

        this.refs.horizontalLeftSpacer.style.width = this.refs.pinnedLeftCells.offsetWidth + 'px';
        this.refs.horizontalRightSpacer.style.width = this.refs.pinnedRightCells.offsetWidth + spacerX + 'px';
        this.refs.horizontalScrollContainer.style.width = this.refs.normalColumns.scrollWidth + 'px';
    }

    protected handleHorizontalScroll = (ev: UIEvent) => {
        const scrollLeft = this.refs.horizontalScrollView.scrollLeft + 'px';
        this.refs.headerContainer.style.transform = `translateX(-${scrollLeft})`;
        this.refs.rowsContainer.style.transform = `translateX(-${scrollLeft})`;
    }

    public render() {

        const rootStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        const headerStyle = {
            height: this.props.headerHeight,
            minHeight: this.props.headerHeight,
        };

        const rowStyle = {
            height: this.props.rowHeight,
            minHeight: this.props.rowHeight,
        }

        return (
            <div className={styles.root} style={rootStyle}>
                {/* headers */}
                <div ref={this.createRef("header")} className={styles.header} style={headerStyle}>
                    <div className={[styles.pinnedLeftColumns, styles.headerColumns]}>
                        {
                            this.pinnedLeftColumns.map(col => {
                                return <Column {...this.columns[col]} />
                            })
                        }
                    </div>
                    <div ref={this.createRef("normalColumns")} className={styles.normalColumns}>
                        <div ref={this.createRef("headerContainer")} className={[styles.headerContainer, styles.headerColumns]}>
                            {
                                this.normalColumns.map(col => {
                                    return <Column {...this.columns[col]} />
                                })
                            }
                        </div>
                    </div>
                    <div className={[styles.pinnedRightColumns, styles.headerColumns]}>
                        {
                            this.pinnedRightColumns.map(col => {
                                return <Column {...this.columns[col]} />
                            })
                        }
                    </div>
                </div>
                {/* body */}
                <div ref={this.createRef("body")} className={styles.body}>
                    <div ref={this.createRef("pinnedLeftCells")} className={styles.pinnedLeftCells}>
                        {
                            this.props.rows.map(row => {
                                return (
                                    <div className={styles.rowCells} style={rowStyle}>
                                        {
                                            this.pinnedLeftColumns.map(col => {
                                                return <Cell data={row[col]} column={this.columns[col]} />;
                                            })
                                        }
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div ref={this.createRef("normalCells")} className={styles.normalCells}>
                        <div ref={this.createRef("rowsContainer")}>
                            {
                                this.props.rows.map(row => {
                                    return (
                                        <div className={styles.rowCells} style={rowStyle}>
                                            {
                                                this.normalColumns.map(col => {
                                                    return <Cell data={row[col]} column={this.columns[col]} />;
                                                })
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div ref={this.createRef("pinnedRightCells")} className={styles.pinnedRightCells}>
                        {
                            this.props.rows.map(row => {
                                return (
                                    <div className={styles.rowCells} style={rowStyle}>
                                        {
                                            this.pinnedRightColumns.map(col => {
                                                return <Cell data={row[col]} column={this.columns[col]} />;
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                {/* fake horizontal scroll bar */}
                <div ref={this.createRef("horizontalScroll")} className={styles.horizontalScroll}>
                    <div ref={this.createRef("horizontalLeftSpacer")} className={styles.horizontalLeftSpacer}></div>
                    <div ref={this.createRef("horizontalScrollView")} className={styles.horizontalScrollView} onScroll={this.handleHorizontalScroll}>
                        <div ref={this.createRef("horizontalScrollContainer")} className={styles.horizontalScrollContainer}></div>
                    </div>
                    <div ref={this.createRef("horizontalRightSpacer")} className={styles.horizontalRightSpacer}></div>
                </div>
            </div>
        );
    }
}

export default Grid;
