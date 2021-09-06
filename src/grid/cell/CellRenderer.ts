import Grid from "@/index";
import { ColumnOptions } from "@/types";
import Component from "./Component";

export interface CellRendererParams<T> {
    props: T;
    value: any;
    column: ColumnOptions;
    row: string;
    gird: Grid;
}

export abstract class CellRenderer<T = {}> extends Component<CellRendererParams<T>> {
    //
}

export default CellRenderer;
