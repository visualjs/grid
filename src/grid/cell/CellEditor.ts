import { ColumnOptions } from "@/types";
import Component from "./Component";
import { Grid } from "@/index";

export interface CellEditorParams<T> {
    props: T;
    value: any;
    column: ColumnOptions;
    row: string;
    gird: Grid;
}

export abstract class CellEditor<T> extends Component<CellEditorParams<T>> {
    // get current editor's value
    public abstract getValue(): any;

    public isPopup(): boolean {
        return false;
    }
}

export default CellEditor;
