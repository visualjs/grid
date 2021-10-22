import { Component } from "preact";
import { Column, Group } from "@/views/column";
import { Grid, State as RootState } from "@/grid";
import { connect, withGrid } from "../root";
import { GroupData } from "@/types";

import styles from './header.module.css';

interface Props {
    grid: Grid;
    height: number;
    groups: string[][];
    groupsData: Record<string, GroupData>;
    columns: string[];
    onColumnResizeStart?: (field: string, width: number, ev: MouseEvent) => void;
    onColumnContextMenu?: (field: string, ev: MouseEvent) => void;
}

class Columns extends Component<Props> {

    protected columnsRoot: HTMLDivElement;

    protected ghost?: HTMLDivElement;

    protected dragIndicator: HTMLDivElement;

    protected currentDragStartField?: string;

    protected currentDragEndField?: string;

    protected getActiveColumn = (ev: Event): HTMLDivElement => {
        let el: any = ev.target;
        let field: string;
        while (el != this.columnsRoot && el) {
            // see if the dom element has field and column info
            if (el.__field && el.__isColumn === true) {
                // if yes, we have found the column, and know which field it is
                field = el.__field;
                break;
            }
            el = el.parentElement;
        }

        if (field) {
            return el;
        }
    }

    protected handleDragStart = (field: string, column: HTMLDivElement, ev: MouseEvent) => {

        if (!this.ghost) {
            this.ghost = document.createElement('div');
            this.ghost.className = styles.columnDragGhost;
        }
        const text = this.props.grid.getColumnOptions(field)?.headerName || '';
        this.ghost.innerHTML = `
            <span class="vg-move ${styles.ghostIcon}"></span>
            <span>${text}</span>
        `;
        this.props.grid.appendChild(this.ghost);

        document.addEventListener('mousemove', this.handleDragMove);
        document.addEventListener('mouseup', this.handleDragEnd);

        this.currentDragStartField = field;
        this.dragIndicator.style.display = 'block';

        this.updateDragEndField(column);
        this.updateDragGhost(ev);
    }

    protected handleDragMove = (ev: MouseEvent) => {
        this.updateDragGhost(ev);
        this.updateDragEndField(this.getActiveColumn(ev));
    }

    protected handleDragEnd = () => {
        document.removeEventListener('mousemove', this.handleDragMove);
        document.removeEventListener('mouseup', this.handleDragEnd);
        this.props.grid.removeChild(this.ghost);
        this.dragIndicator.style.display = 'none';

        this.props.grid.store('column').moveColumn(
            this.currentDragStartField, this.currentDragEndField
        );
    }

    protected updateDragGhost = (ev: MouseEvent) => {
        if (!this.ghost) return;
        const rootRect = this.props.grid.getRootElement().getBoundingClientRect();
        this.ghost.style.left = ev.clientX - rootRect.left + 10 + 'px';
        this.ghost.style.top = ev.clientY - rootRect.top + 10 + 'px';
    }

    protected updateDragEndField = (column?: HTMLDivElement) => {
        if (!column) return;
        const rootRect = this.columnsRoot.getBoundingClientRect();
        const columnRect = column.getBoundingClientRect();
        this.currentDragEndField = (column as any).__field;
        this.dragIndicator.style.left = (columnRect.left - rootRect.left) + 'px';
        this.dragIndicator.style.height = columnRect.height + 'px';
        this.dragIndicator.style.width = columnRect.width + 'px';
    }


    render() {

        const { columns, groups } = this.props;

        const style = {
            height: this.props.height,
            minHeight: this.props.height,
        };

        return (
            <>
                {
                    groups.map(items => {
                        return (
                            <div className={styles.headerColumns} style={style}>
                                {
                                    items.map((group, i) => {
                                        return <Group key={group + String(i)} value={group} columns={columns} />;
                                    })
                                }
                            </div>
                        );
                    })
                }
                <div ref={node => this.columnsRoot = node} className={styles.headerColumns} style={style}>
                    <div ref={node => this.dragIndicator = node} className={styles.columnDragIndicator}></div>
                    {
                        columns.map(col => {
                            const hasContextMenu = this.props.grid.getColumnMenuItems(col).length > 0;
                            return (
                                <Column
                                    key={col}
                                    value={col}
                                    onResize={this.props.onColumnResizeStart}
                                    onDragStart={this.handleDragStart}
                                    onContextMenu={hasContextMenu ? this.props.onColumnContextMenu : undefined}
                                />
                            );
                        })
                    }
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        height: state.column.height,
        groups: state.column.groups,
        groupsData: state.column.groupsData,
    };
}

export default connect(mapStateToProps)(withGrid(Columns));
