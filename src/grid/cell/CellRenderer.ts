import { ColumnOptions } from "@/types";
import Component from "./Component";

export interface CellRendererParams<T> {
    props: T;
    value: any;
    column: ColumnOptions;
}

export abstract class CellRenderer<T> extends Component<CellRendererParams<T>> {
    //
}

export default CellRenderer;
