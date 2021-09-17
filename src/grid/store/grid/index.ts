import { Store as BaseStore } from "@/grid/store";
import { Fillable, GetContextMenuItemsParams, MenuItem } from "@/types";
import update from 'immutability-helper';

export interface Actions {
    setLoading: boolean;
    setHorizontalScrollLeft: number;
}

export interface State {
    width: string;
    height: string;
    preloadRowCount: number;
    horizontalScrollLeft?: number;
    fillable?: Fillable;
    loading?: boolean;
    // context menus
    getContextMenuItems?: (params: GetContextMenuItemsParams) => MenuItem[];
}

const initialState: State = {
    width: '100%',
    height: '100%',
    preloadRowCount: 20,
};

export class Store extends BaseStore<State, Actions> {
    constructor(initial?: Partial<State>) {
        super({
            setHorizontalScrollLeft: [],
            setLoading: [],
        }, Object.assign({}, initialState, initial));

        this.handle('setHorizontalScrollLeft', (state, scrollLeft) => {
            return { ...state, horizontalScrollLeft: scrollLeft };
        });

        this.handle('setLoading', (state, loading) => {
            return update(state, {
                loading: { $set: loading }
            });
        });
    }
}

export default Store;
