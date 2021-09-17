import CellRange from "@/selection/CellRange";
import { FillRange } from "@/selection/FillRange";
import { Store as BaseStore } from "@/grid/store";
import { CellPosition, Coordinate } from "@/types";

export interface Actions {
    selectCells: { start: Coordinate, end: Coordinate } | undefined;
    setEditing: CellPosition | undefined;
    setFilling: FillRange | undefined;
}

export interface State {
    editing?: CellPosition;
    selections: CellRange[];
    filling?: FillRange;
}

const initialState: State = {
    selections: []
};

export class Store extends BaseStore<State, Actions> {
    constructor(initial?: Partial<State>) {
        super({
            selectCells: [],
            setEditing: [],
            setFilling: [],
        }, Object.assign({}, initialState, initial));

        this.handle('selectCells', (state, selected) => {
            if (!selected) {
                return { ...state, selections: [] };
            }
            return { ...state, selections: [new CellRange(selected.start, selected.end)] };
        });

        this.handle('setEditing', (state, editing) => {
            return { ...state, editing };
        });

        this.handle('setFilling', (state, filling) => {
            return { ...state, filling };
        });
    }

    public setEditing(pos?: CellPosition) {
        this.dispatch('setEditing', pos);
    }

    public stopEditing() {
        this.dispatch('setEditing', undefined);
    }

    public getCoordLocatedRange(coord: Coordinate): CellRange | undefined {
        for (let i = 0; i < this._state.selections.length; i++) {
            if (this._state.selections[i].contains(coord)) {
                return this._state.selections[i];
            }
        }
    }
}

export default Store;
