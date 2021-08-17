import { GridOptions } from '@/types';
import Column, { ColumnProps } from '@/column';
import Cell from '@/cell';
import { h } from '@/component';

import styles from './grid.module.css';

const defaultOptions = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    rowHeight: 28,
}

class Grid {

    // save ordered column fields
    protected pinnedLeftColumns: string[] = [];

    protected pinnedRightColumns: string[] = [];

    protected normalColumns: string[] = [];

    // use the column field as the key, and the column option as the value
    protected columns: Record<string, ColumnProps> = {};

    constructor(private options: GridOptions) {
        this.options = Object.assign(defaultOptions, options);

        this.options.columns.forEach(col => {
            if (col.pinned == 'left') {
                this.pinnedLeftColumns.push(col.field);
            } else if (col.pinned == 'right') {
                this.pinnedRightColumns.push(col.field);
            } else {
                this.normalColumns.push(col.field);
            }

            this.columns[col.field] = col;
        })

        this.load();
    }

    protected load() {
        this.options.container.appendChild(this.render());
    }

    protected render(): HTMLElement {

        const rootStyle = {
            width: this.options.width,
            height: this.options.height,
        };

        const headerStyle = {
            height: this.options.headerHeight,
            minHeight: this.options.headerHeight,
        };

        const rowStyle = {
            height: this.options.rowHeight,
            minHeight: this.options.rowHeight,
        }

        return (
            <div className={styles.root} style={rootStyle}>
                {/* headers */}
                <div className={styles.header} style={headerStyle}>
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
                <div className={styles.body}>
                    <div className={styles.pinnedLeftCells}>
                        {
                            this.options.rows.map(row => {
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
                    <div className={styles.normalCells}>
                        {
                            this.options.rows.map(row => {
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
                            this.options.rows.map(row => {
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
