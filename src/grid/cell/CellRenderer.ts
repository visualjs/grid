import { ColumnOptions } from "@/types";
import Grid from "../Grid";
import Component from "./Component";

export interface CellRendererParams<T> {
    props: T;
    value: any;
    column: ColumnOptions;
    row: string;
    grid: Grid;
}

export abstract class CellRenderer<T = {}> extends Component<CellRendererParams<T>> {
    //
}

export default CellRenderer;
