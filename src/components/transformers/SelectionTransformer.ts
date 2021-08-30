import { CellTransformer, CellTransformerParams } from "@/grid/cell";

export interface Props {
    allowNotExistOption?: boolean;
    options?: string[];
}

export class SelectionTransformer extends CellTransformer {

    constructor(protected props: Props = { allowNotExistOption: true }) {
        super();
    }

    public format(params: CellTransformerParams): string {
        if ('string' === typeof params.value) {
            return params.value;
        }

        if (Array.isArray(params.value)) {
            return params.value.toString();
        }

        return '';
    }

    public parse(params: CellTransformerParams): any {
        if (Array.isArray(params.value)) {
            return params.value;
        }

        if ('string' === typeof params.value) {
            const values = params.value.split(',');
            if (!this.props.allowNotExistOption) {
                return values.filter((val) => {
                    return this.props.options.indexOf(val) > -1
                })
            }

            return values;
        }

        return [];
    }
}

export default SelectionTransformer;
