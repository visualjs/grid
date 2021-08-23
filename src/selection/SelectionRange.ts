import { Coordinate } from "@/types";

class SelectionRange {

    protected minX: number;

    protected minY: number;

    protected maxX: number;

    protected maxY: number;

    constructor(public start: Coordinate, public end: Coordinate) {
        if (!start || !end) {
            return;
        }

        this.minX = this.min(start.x, end.x);
        this.minY = this.min(start.y, end.y);
        this.maxX = this.max(start.x, end.x);
        this.maxY = this.max(start.y, end.y);
    }

    protected min(l: number, r: number): number {
        return l < r ? l : r;
    }

    protected max(l: number, r: number): number {
        return l > r ? l : r;
    }

    public contains(coord: Coordinate): boolean {
        if (!this.start || !this.end) {
            return false;
        }

        return (
            coord.x >= this.minX && coord.x <= this.maxX
            && coord.y >= this.minY && coord.y <= this.maxY
        );
    }

    public isLeft(coord: Coordinate) {
        if (!this.start || !this.end) {
            return false;
        }

        return coord.x == this.minX;
    }

    public isRight(coord: Coordinate) {
        if (!this.start || !this.end) {
            return false;
        }

        return coord.x == this.maxX;
    }

    public isTop(coord: Coordinate) {
        if (!this.start || !this.end) {
            return false;
        }

        return coord.y == this.minY;
    }

    public isBottom(coord: Coordinate) {
        if (!this.start || !this.end) {
            return false;
        }

        return coord.y == this.maxY;
    }
}

export default SelectionRange;
