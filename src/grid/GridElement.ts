import { Component } from "./Component";
import Grid from "./Grid";

abstract class GridElement<P = {}, S = {}> extends Component<P & { grid: Grid }, S> {

    protected grid: Grid;

    constructor(props: P) {
        super(props as P & { grid: Grid });
        this.grid = this.props.grid;
    }

}

export default GridElement;
