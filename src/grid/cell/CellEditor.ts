import { ColumnOptions } from "@/types";
import Component from "./Component";

export interface CellEditorParams<T> {
    props: T;
    value: any;
    column: ColumnOptions;
}

export abstract class CellEditor<T> extends Component<CellEditorParams<T>> {
    // get current editor's value
    public abstract getValue(): any;

    public isPopup(): boolean {
        return false;
    }
}

export default CellEditor;
