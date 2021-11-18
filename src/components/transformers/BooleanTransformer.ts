import { CellTransformer, CellTransformerParams, ParseFromClipboardParams } from '@/grid/cell';

export class BooleanTransformer extends CellTransformer {
    public parseFromClipboard(params: ParseFromClipboardParams): any {
        return params.value;
    }

    public format(params: CellTransformerParams): string {
        return Boolean(params.value) ? '1' : '';
    }

    public parse(params: CellTransformerParams): any {
        return Boolean(params.value);
    }
}

export default BooleanTransformer;
