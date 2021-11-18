import { ColumnOptions, Coordinate } from '@/types';
import { Grid } from '@/index';

export interface CellTransformerParams {
    value: any;
    column: ColumnOptions;
    gird: Grid;
    oldValue?: any;
}

export type ParseFromClipboardParams = Omit<CellTransformerParams, 'value'> & {
    value: {
        value: any;
        type: string;
    } & Coordinate;
};

export abstract class CellTransformer {
    // Format cell data before rendering without cellRender or copy to clipboard
    abstract format(params: CellTransformerParams): string;

    // Parse input data before setting new value
    abstract parse(params: CellTransformerParams): any;

    //  parse data form clipboard when execute paste
    abstract parseFromClipboard(params: ParseFromClipboardParams): any;
}

export default CellTransformer;
