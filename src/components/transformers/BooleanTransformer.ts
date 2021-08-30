import { CellTransformer, CellTransformerParams } from "@/grid/cell";

export class BooleanTransformer extends CellTransformer {

    public format(params: CellTransformerParams): string {
        return Boolean(params.value) ? '1' : '';
    }

    public parse(params: CellTransformerParams): any {
        return Boolean(params.value);
    }
}

export default BooleanTransformer;
