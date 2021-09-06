import { Store as BaseStore } from "@/grid/store";
import { Fillable, GetContextMenuItemsParams, MenuItem } from "@/types";

export interface Actions {
    setHorizontalScrollLeft: number;
}

export interface State {
    width: string;
    height: string;
    headerHeight: number;
    preloadRowCount: number;
    horizontalScrollLeft?: number;
    fillable?: Fillable;
    // context menus
    getContextMenuItems?: (params: GetContextMenuItemsParams) => MenuItem[];
}

const initialState: State = {
    width: '100%',
    height: '100%',
    headerHeight: 30,
    preloadRowCount: 20,
};

export class Store extends BaseStore<State, Actions> {
    constructor(initial?: Partial<State>) {
        super({
            setHorizontalScrollLeft: []
        }, Object.assign({}, initialState, initial));

        this.handle('setHorizontalScrollLeft', (state, scrollLeft) => {
            return { ...state, horizontalScrollLeft: scrollLeft };
        });
    }
}

export default Store;
