import { Component } from "@/component";
import Grid from "./Grid";

abstract class GridElement<P = {}> extends Component<P & { grid: Grid }> {

    protected grid: Grid;

    constructor(props: P) {
        super(props as P & { grid: Grid });
        this.grid = this.props.grid;
    }

}

export default GridElement;
