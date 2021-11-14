import { Coordinate } from "@/types";

export abstract class Range {

    public minX: number;

    public minY: number;

    public maxX: number;

    public maxY: number;

    protected abstract isEmpty(): boolean;

    public each(callback: (coord: Coordinate, relative?: Coordinate) => void | boolean) {
        for (let y = this.minY; y <= this.maxY; y++) {
            for (let x = this.minX; x <= this.maxX; x++) {
                if (callback({ x, y }, { x: x - this.minX, y: y - this.minY }) === false) {
                    return;
                }
            }
        }
    }

    public eachRow(callback: (y: number, relative?: number) => void | boolean) {
        for (let y = this.minY; y <= this.maxY; y++) {
            if (callback(y, y - this.minY) === false) {
                return;
            }
        }
    }

    public getStartCoord(): Coordinate {
        return { x: this.minX, y: this.minY };
    }

    public getEndCoord(): Coordinate {
        return { x: this.maxX, y: this.maxY };
    }

    public getGlobalCoord(relative: Coordinate): Coordinate {
        return { x: this.minX + relative.x, y: this.minY + relative.y };
    }

    public contains(coord: Coordinate): boolean {
        if (this.isEmpty()) {
            return false;
        }

        return (
            coord.x >= this.minX && coord.x <= this.maxX
            && coord.y >= this.minY && coord.y <= this.maxY
        );
    }

    public isLeft(coord: Coordinate) {
        if (this.isEmpty()) {
            return false;
        }

        return coord.x == this.minX;
    }

    public isRight(coord: Coordinate) {
        if (this.isEmpty()) {
            return false;
        }

        return coord.x == this.maxX;
    }

    public isTop(coord: Coordinate) {
        if (this.isEmpty()) {
            return false;
        }

        return coord.y == this.minY;
    }

    public isBottom(coord: Coordinate) {
        if (this.isEmpty()) {
            return false;
        }

        return coord.y == this.maxY;
    }
}

export default Range;
