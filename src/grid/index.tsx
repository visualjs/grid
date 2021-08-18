import { GridOptions } from '@/types';
import Column, { ColumnProps } from '@/column';
import Cell from '@/cell';
import { Component, h, render } from '@/component';

import styles from './grid.module.css';

const defaultOptions = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    rowHeight: 28,
}

class Grid extends Component<GridOptions> {

    // save ordered column fields
    protected pinnedLeftColumns: string[] = [];

    protected pinnedRightColumns: string[] = [];

    protected normalColumns: string[] = [];

    // use the column field as the key, and the column option as the value
    protected columns: Record<string, ColumnProps> = {};

    constructor(props: GridOptions) {
        super(props);

        this.props = Object.assign(defaultOptions, props);

        this.props.columns.forEach(col => {
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
        this.resetScrollSpacer();
    }

    protected doRender() {
        render(this.render(), this.props.container);
    }

    protected resetScrollSpacer() {
        const spacerX = this.refs.body.offsetWidth - this.refs.body.clientWidth;
        this.refs.header.style.paddingRight = spacerX + 'px';
    }

    protected handleRootClick = () => {
        console.log('root clicked');
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
            <div onClick={this.handleRootClick} ref={this.createRef("root")} className={styles.root} style={rootStyle}>
                {/* headers */}
                <div ref={this.createRef("header")} className={styles.header} style={headerStyle}>
                    <div className={[styles.pinnedLeftColumns, styles.headerColumns]}>
                        {
                            this.pinnedLeftColumns.map(col => {
                                return <Column {...this.columns[col]} />
                            })
                        }
                    </div>
                    <div className={[styles.normalColumns, styles.headerColumns]}>
                        {
                            this.normalColumns.map(col => {
                                return <Column {...this.columns[col]} />
                            })
                        }
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
                    <div className={styles.pinnedLeftCells}>
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
                    <div className={styles.pinnedRightCells}>
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
            </div>
        );
    }
}

export default Grid;
