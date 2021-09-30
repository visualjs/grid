import Grid from ".";

interface AnyEvents {
    [key: string]: (grid: Grid, cb: Function) => () => void;
}

class Observer<Events extends AnyEvents> {

    constructor(protected grid: Grid, protected events: Events) {
        // 
    }

    public on<K extends keyof Events, P extends Parameters<Events[K]>>(event: K, cb: P[1]) {
        this.events[event](this.grid, cb);
    }

}

export default Observer;
