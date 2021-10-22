import Component from "@/views/PureComponent";
import { connect, withGrid } from "@/views/root";
import Grid, { State as RootState } from "@/grid";
import { ColumnOptions } from "@/types";
import { JSXInternal } from "preact/src/jsx";
import clsx from "clsx";

import styles from './column.module.css';

export interface Props {
    value: string;
    options: ColumnOptions;
    grid: Grid,
    onResize?: (field: string, width: number, ev: MouseEvent) => void;
    onDragStart?: (field: string, column: HTMLDivElement, ev: MouseEvent) => void;
    onContextMenu?: (field: string, ev: MouseEvent) => void;
}

class Column extends Component<Props> {

    protected self: HTMLDivElement;

    protected get options() {
        return this.props.options;
    }

    componentDidMount() {
        this.bindMetaData();
    }

    componentDidUpdate() {
        this.bindMetaData();
    }

    protected bindMetaData = () => {
        (this.self as any).__isColumn = true;
        (this.self as any).__field = this.options.field;
    }

    protected handleDragStart = (ev: MouseEvent) => {
        this.props.onDragStart && this.props.onDragStart(
            this.options.field, this.self, ev
        );
    }

    protected handleMouseDown = (ev: MouseEvent) => {
        this.props.onResize && this.props.onResize(
            this.options.field, this.self.offsetWidth, ev
        );
    }

    protected handleContextMenu = (ev: MouseEvent) => {
        if (this.props.onContextMenu) {
            this.props.onContextMenu(this.props.value, ev);
        }
    }

    render() {

        const cellStyle: JSXInternal.CSSProperties = {
            width: this.options.width,
            minWidth: this.options.minWidth
        }

        if (this.options.flex) {
            cellStyle.flexGrow = this.options.flex;
        }

        const headerClassParam = { column: this.props.value, grid: this.props.grid };

        const className = clsx(
            styles.headerColumnContent,
            // custom class name
            this.options.headerClass || [],
            this.options.getHeaderClass ? this.options.getHeaderClass(headerClassParam) : []
        );

        const headerStyle = {
            ...this.options.headerStyle,
            ...(this.options.getHeaderStyle ? this.options.getHeaderStyle(headerClassParam) : {})
        }

        return (
            <div ref={node => this.self = node} className={styles.headerColumn} style={cellStyle}>
                <div className={className} style={headerStyle}>
                    {
                        this.options.sortable &&
                        <span onMouseDown={this.handleDragStart} className={clsx(["vg-move", styles.columnIcon, styles.columnDragHandle])}></span>
                    }
                    <span className={styles.headerName}>{this.options.headerName}</span>
                    {
                        this.props.onContextMenu
                        && <span onClick={this.handleContextMenu} className={`${styles.columnIcon} vg-menu`}></span>
                    }
                    {
                        !this.options.flex && this.options.resizable
                        && <div ref={this.createRef("resizer")} onMouseDown={this.handleMouseDown} className={styles.columnResizeHolder}></div>
                    }
                </div>
            </div>
        );
    }
}

export default connect((state: RootState, { props }: { props: Props }) => {
    return {
        options: state.column.columns[props.value],
    };
})(withGrid(Column));
