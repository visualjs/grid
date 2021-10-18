import Component from "@/views/PureComponent";
import { Grid } from "@/grid";
import { DOM, unique } from '@/utils';
import { withGrid } from "@/views/root";
import { ComponentChildren, createRef, RefObject } from "preact";
import { JSXInternal } from "preact/src/jsx";

import styles from './row.module.css';
import clsx from "clsx";

interface Props {
    value: string;
    children?: ComponentChildren;
    style?: JSXInternal.CSSProperties;
    grid: Grid;
}

class Row extends Component<Props> {

    protected unsubscribe: () => void;

    protected self: RefObject<HTMLDivElement> = createRef();

    componentDidMount() {
        this.unsubscribe = this.props.grid.store('row').subscribeAny(this.updateState);
        this.updateState();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    protected updateState = () => {

        if (!this.self.current) return;

        const index = this.props.grid.store('row').getRowIndex(this.props.value);
        const hovered = this.props.grid.state('row').hoveredRow === this.props.value;
        const selected = this.props.grid.state('row').selectedRows.indexOf(this.props.value) !== -1;

        if (index % 2 === 0) {
            DOM.appendClassName(this.self.current, styles.rowStripeCells);
        } else {
            DOM.removeClassName(this.self.current, styles.rowStripeCells);
        }

        if (hovered) {
            DOM.appendClassName(this.self.current, styles.rowCellsHover);
        } else {
            DOM.removeClassName(this.self.current, styles.rowCellsHover);
        }

        if (selected) {
            DOM.appendClassName(this.self.current, styles.rowCellsSelect);
        } else {
            DOM.removeClassName(this.self.current, styles.rowCellsSelect);
        }
    }

    render() {

        const rowClassParams = {row: this.props.value, grid: this.props.grid};

        let style: JSXInternal.CSSProperties = {
            ...this.props.grid.state('row').rowStyle,
            ...this.props.style,
        };

        // set style for each row individually
        if (this.props.grid.state('row').getRowStyle) {
            style = Object.assign({}, style, this.props.grid.state('row').getRowStyle(rowClassParams))
        }

        let classNames = this.props.grid.state('row').rowClass || [];
        classNames.push(styles.rowCells);

        // set class(es) for each row individually.
        if (this.props.grid.state('row').getRowClass) {
            classNames = classNames.concat(this.props.grid.state('row').getRowClass(rowClassParams));
        }

        classNames = unique(classNames);

        return (
            <div ref={this.self} style={style} className={clsx(classNames)}>
                {this.props.children}
            </div>
        );
    }
}

export default withGrid(Row);
