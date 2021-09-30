import { useContext, useLayoutEffect, useState } from "preact/hooks";
import { ComponentType } from "preact";
import GridContext from "./Context";
import { useSelector } from "@/grid/store/useSelector";
import Grid from "@/grid";
import { State } from "@/grid";

export function connect<S, A>(selector: (state: State, props?: any) => S, mapActions?: (grid: Grid) => A) {
    return function <P extends S>(Wrapped: ComponentType<P & A>) {
        return function (props: Omit<P, keyof S | keyof A>) {

            const grid: Grid = useContext(GridContext);
            const [state, setState] = useState(selector(grid.getState(), { grid: grid, props: props }));
            const actions = mapActions ? mapActions(grid) : undefined;

            useLayoutEffect(() => {
                const s = useSelector(grid.getRoot(), selector, (state) => {
                    setState(state);
                }, { grid: grid, props: props });
                return s.cancel;
            }, []);

            return <Wrapped {...state} {...props as P} {...actions} />;
        }
    }
}

export default connect;
