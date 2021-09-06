import { useContext } from "preact/hooks";
import { ComponentType } from "preact";
import GridContext from "./Context";
import Grid from "@/grid";

export interface WithGridProps {
    grid: Grid;
}

export function withGrid<P extends WithGridProps>(Wrapped: ComponentType<P>) {
    return function (props: Omit<P, 'grid'>) {
        const grid: Grid = useContext(GridContext);
        return <Wrapped grid={grid}  {...props as P} />;
    }
}

export default withGrid;
