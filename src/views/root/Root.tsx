import Grid from "@/grid";
import { ComponentChildren } from "preact";
import GridContext from "./Context";

export function Root(props: { grid: Grid, children?: ComponentChildren }) {
    return (
        <GridContext.Provider value={props.grid}>
            {props.children}
        </GridContext.Provider>
    );
}

export default Root;
