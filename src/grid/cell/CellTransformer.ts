import { ColumnOptions } from "@/types";

export interface CellTransformerParams {
    value: any;
    column: ColumnOptions;
}

export abstract class CellTransformer {

    // Format cell data before rendering without cellRender or copy to clipboard
    abstract format(params: CellTransformerParams): string;

    // Parse input data before setting new value
    abstract parse(params: CellTransformerParams): any;
}

export default CellTransformer;
