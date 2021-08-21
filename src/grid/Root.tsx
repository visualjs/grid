import GridElement from "@/grid/GridElement";
import Column from '@/column';
import {  RowData } from "@/types";
import { classes } from "@/utils";

import List from './List';
import Body from './Body';

import styles from './grid.module.css';

interface GridProps {
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
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

class GridRoot extends GridElement<GridProps, RootState> {

    public componentDidMount = () => {
        this.resize();
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
            horizontalScrollWidth: this.refs.normalColumns.current.scrollWidth,
            horizontalLeftSpacer: this.refs.pinnedLeftColumns.current.offsetWidth,
            horizontalRightSpacer: this.refs.pinnedRightColumns.current.offsetWidth + spacerX,
        })
    }

    /**
     * Event handlers
     */

    protected handleColumnResize = (field: string, width: number) => {
        this.resize();
    }

    protected handleHorizontalScroll = (ev: UIEvent) => {
        this.setState({
            horizontalScrollLeft: (ev.target as HTMLDivElement).scrollLeft
        })
    }

    protected listRender = (items: RowData[]) => {
        return (
            <Body
                grid={this.grid}
                items={items}
                pinnedLeftColumns={this.props.pinnedLeftColumns}
                pinnedRightColumns={this.props.pinnedRightColumns}
                normalColumns={this.props.normalColumns}
                horizontalScrollLeft={this.state.horizontalScrollLeft}
            />
        )
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

        return (
            <div className={styles.root} style={rootStyle}>
                {/* headers */}
                <div className={styles.header} style={headerStyle}>
                    <div ref={this.createRef("pinnedLeftColumns")} className={classes([styles.pinnedLeftColumns, styles.headerColumns])}>
                        {
                            this.props.pinnedLeftColumns.map(col => {
                                return <Column grid={this.grid} onResize={this.handleColumnResize} {...this.grid.getColumnOptions(col)} />
                            })
                        }
                    </div>
                    <div ref={this.createRef("normalColumns")} className={styles.normalColumns}>
                        <div
                            ref={this.createRef("headerContainer")}
                            style={{ transform: `translateX(-${this.state.horizontalScrollLeft}px)` }}
                            className={classes([styles.headerContainer, styles.headerColumns])}
                        >
                            {
                                this.props.normalColumns.map(col => {
                                    return <Column grid={this.grid} onResize={this.handleColumnResize} {...this.grid.getColumnOptions(col)} />
                                })
                            }
                        </div>
                    </div>
                    <div ref={this.createRef("pinnedRightColumns")} className={classes([styles.pinnedRightColumns, styles.headerColumns])}>
                        {
                            this.props.pinnedRightColumns.map(col => {
                                return <Column grid={this.grid} onResize={this.handleColumnResize} {...this.grid.getColumnOptions(col)} />
                            })
                        }
                    </div>
                </div>
                {/* body */}
                <div className={styles.body}>
                    <List
                        ref={this.createRef("list")}
                        items={this.grid.getRows()}
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
            </div>
        );
    }

}

export default GridRoot;
