import { Coordinate } from "@/types";
import CellRange from "./CellRange";
import Range from './Range';

export class FillRange extends Range {

    protected start: Coordinate;

    protected end: Coordinate;

    constructor(protected ref: CellRange, protected current: Coordinate, protected limit?: 'x' | 'y' | 'xy') {

        super();

        if (this.limit === undefined || !ref || !current || ref.contains(current)) {
            return;
        }

        if (this.limit === 'xy') {
            this.limit = Math.abs(current.x - ref.end.x) > Math.abs(current.y - ref.end.y) ? 'x' : 'y';
        }

        this.start = ref.getStartCoord();
        this.end = current;

        if (this.limit === 'x') {
            this.end.y = ref.end.y;
            this.start.x = current.x < ref.start.x ? ref.start.x - 1 : ref.end.x + 1;
        } else {
            this.end.x = ref.end.x;
            this.start.y = current.y < ref.start.y ? ref.start.y - 1 : ref.end.y + 1;
        }

        this.minX = Math.min(this.start.x, this.end.x);
        this.minY = Math.min(this.start.y, this.end.y);
        this.maxX = Math.max(this.start.x, this.end.x);
        this.maxY = Math.max(this.start.y, this.end.y);
    }

    public isEmpty(): boolean {
        return !this.start || !this.end;
    }

    public getReference(): CellRange {
        return this.ref;
    }

    public chunk(callback: (range: CellRange) => void | boolean) {
        if (this.isEmpty()) {
            return;
        }

        const refStart = this.ref.getStartCoord();
        const refEnd = this.ref.getEndCoord();
        // If the data is filled in reverse,
        // our block algorithm needs to be changed
        const isReverse = this.minX < refStart.x || this.minY < refStart.y;
        
        // By default, we assume that the limit is the Y axis
        let chunks: CellRange[] = [];
        let chunkSize = refEnd.y - refStart.y;
        let target = isReverse ? this.minY : this.maxY;
        let current = isReverse ? this.maxY : this.minY;

        // If the filling limit is the X axis,
        // we need to modify chunkSize, target and current variables
        if (this.limit === 'x') {
            chunkSize = refEnd.x - refStart.x;
            target = isReverse ? this.minX : this.maxX;
            current = isReverse ? this.maxX : this.minX;
        }

        while (true) {
            // The start coordinates of the new chunk
            const start = this.limit === 'x' ? { x: current, y: this.minY } : { x: this.minX, y: current };
            // Offset the current value according to the chunk size,
            // We also need to be careful not to exceed the target
            current = isReverse ? Math.max(current - chunkSize, target) : Math.min(current + chunkSize, target);

            // Use the offset value to set the end of the block
            const end = this.limit === 'x' ? { x: current, y: this.maxY } : { x: this.maxX, y: current };
            chunks.push(new CellRange(start, end));

            if (current == target) break;
            // Move current pointer to next chunk
            current += (isReverse ? -1 : 1);
        }

        chunks.forEach(range => {
            if (callback(range) === false) {
                return;
            }
        });
    }
}