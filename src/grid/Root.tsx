import GridElement from "@/grid/GridElement";
import { h } from '@/component';
import Column from '@/column';
import List from './List';
import Body from './Body';

import styles from './grid.module.css';
import { ColumnOptions, GridOptions } from "@/types";

const defaultColumnOptions = {
    width: 200,
    minWidth: 50,
};

class GridRoot extends GridElement<GridOptions> {

    // save ordered column fields
    protected pinnedLeftColumns: string[] = [];

    protected pinnedRightColumns: string[] = [];

    protected normalColumns: string[] = [];

    // use the column field as the key, and the column option as the value
    protected columns: Record<string, ColumnOptions> = {};

    constructor(props: GridOptions) {
        super(props);

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
    }

    public componentDidMount = () => {
        this.resize();
    }

    public getColumnOptions(col: string) {
        return this.columns[col];
    }

    public resize() {
        // If a vertical scroll bar appears, the last column will be misaligned
        // a spacer needs to be added
        const spacerX = this.refs.body.offsetWidth - this.refs.body.clientWidth;
        this.refs.header.style.paddingRight = spacerX + 'px';

        // this.refs.pinnedLeftCells.style.height = contentHeight;
        // this.refs.normalCells.style.height = contentHeight;
        // this.refs.pinnedRightCells.style.height = contentHeight;

        // fake horizontal scrollbar
        if (this.refs.headerContainer.scrollWidth > this.refs.normalColumns.clientWidth) {
            // we need to show a horizontal scrollbar
            this.refs.horizontalScroll.style.height = this.refs.horizontalScrollContainer.offsetHeight + 'px';
        } else {
            this.refs.horizontalScroll.style.height = '0px';
        }

        this.refs.horizontalLeftSpacer.style.width = this.refs.pinnedLeftColumns.offsetWidth + 'px';
        this.refs.horizontalRightSpacer.style.width = this.refs.pinnedRightColumns.offsetWidth + spacerX + 'px';
        this.refs.horizontalScrollContainer.style.width = this.refs.normalColumns.scrollWidth + 'px';
    }

    /**
     * Event handlers
     */

    protected handleColumnResize = (field: string, width: number) => {
        this.resize();
    }

    protected handleHorizontalScroll = (ev: UIEvent) => {
        const scrollLeft = this.refs.horizontalScrollView.scrollLeft + 'px';
        this.refs.headerContainer.style.transform = `translateX(-${scrollLeft})`;
        // this.refs.rowsContainer.style.transform = `translateX(-${scrollLeft})`;
    }

    protected listRender = (item: any) => {
        return <Body grid={this.grid} item={item} />
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

        return (
            <div className={styles.root} style={rootStyle}>
                {/* headers */}
                <div ref={this.createRef("header")} className={styles.header} style={headerStyle}>
                    <div ref={this.createRef("pinnedLeftColumns")} className={[styles.pinnedLeftColumns, styles.headerColumns]}>
                        {
                            this.pinnedLeftColumns.map(col => {
                                return <Column onResize={this.handleColumnResize} {...this.columns[col]} />
                            })
                        }
                    </div>
                    <div ref={this.createRef("normalColumns")} className={styles.normalColumns}>
                        <div ref={this.createRef("headerContainer")} className={[styles.headerContainer, styles.headerColumns]}>
                            {
                                this.normalColumns.map(col => {
                                    return <Column onResize={this.handleColumnResize} {...this.columns[col]} />
                                })
                            }
                        </div>
                    </div>
                    <div ref={this.createRef("pinnedRightColumns")} className={[styles.pinnedRightColumns, styles.headerColumns]}>
                        {
                            this.pinnedRightColumns.map(col => {
                                return <Column onResize={this.handleColumnResize} {...this.columns[col]} />
                            })
                        }
                    </div>
                </div>
                {/* body */}
                <div ref={this.createRef("body")} className={styles.body}>
                    <List grid={this.grid} items={this.props.rows} itemHeight={this.props.rowHeight} render={this.listRender} />
                    {/* <div ref={this.createRef("pinnedLeftCells")} className={styles.pinnedLeftCells}>
                        {
                            this.props.rows.map(row => {
                                return <Row grid={this.grid} data={row} columns={this.pinnedLeftColumns} />
                            })
                        }
                    </div>
                    <div ref={this.createRef("normalCells")} className={styles.normalCells}>
                        <div ref={this.createRef("rowsContainer")}>
                            {
                                this.props.rows.map(row => {
                                    return <Row grid={this.grid} data={row} columns={this.normalColumns} />
                                })
                            }
                        </div>
                    </div>
                    <div ref={this.createRef("pinnedRightCells")} className={styles.pinnedRightCells}>
                        {
                            this.props.rows.map(row => {
                                return <Row grid={this.grid} data={row} columns={this.pinnedRightColumns} />
                            })
                        }
                    </div> */}
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

export default GridRoot;
