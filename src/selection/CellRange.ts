import { Coordinate } from "@/types";
import Range from './Range';

export class CellRange extends Range  {

    constructor(public start: Coordinate, public end: Coordinate) {

        super();

        if (!start || !end) {
            return;
        }

        this.minX = Math.min(start.x, end.x);
        this.minY = Math.min(start.y, end.y);
        this.maxX = Math.max(start.x, end.x);
        this.maxY = Math.max(start.y, end.y);
    }

    public isEmpty(): boolean {
        return !this.start || !this.end;
    }
}

export default CellRange;
