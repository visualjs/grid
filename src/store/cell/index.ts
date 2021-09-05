import CellRange from "@/selection/CellRange";
import { Store as BaseStore } from "@/store";
import { Coordinate } from "@/types";

export interface Actions {
    selectCells: { start: Coordinate, end: Coordinate };
}

export interface State {
    selections: CellRange[];
}

const initialState: State = {
    selections: []
};

export class Store extends BaseStore<State, Actions> {
    constructor(initial?: Partial<State>) {
        super({
            selectCells: []
        }, Object.assign({}, initialState, initial));

        this.handle('selectCells', (state, { start, end }) => {
            return { ...state, selections: [new CellRange(start, end)] };
        });
    }
}

export default Store;
