import { GridOptions } from "@/types";
import { CellTransformer } from "..";
import { CellTransformerParams } from "./cell";

class Transformer extends CellTransformer {

    constructor(protected prefix = 'trans_') {
        super();
    }

    format(params: CellTransformerParams): string {
        return this.prefix + params.value;
    }

    parse(params: CellTransformerParams): any {
        return params.value.replace(this.prefix, '');
    }
}

export const data: GridOptions = {
    // orders: id - status - name - month - date - game
    columns: [
        { field: 'id', pinned: 'left' },
        { field: 'name', transformer: new Transformer() },
        { field: 'status', pinned: 'left' },
        { field: 'month' },
        { field: 'game', pinned: 'right' },
        { field: 'date' }
    ],
    rows: [
        { id: 'r_01', status: 'status_01', name: 'name_01', month: 'month_01', date: 'date_01', game: 'game_01' },
        { id: 'r_02', status: 'status_02', name: 'name_02', month: 'month_02', date: 'date_02', game: 'game_02' },
        { id: 'r_03', status: 'status_03', name: 'name_03', month: 'month_03', date: 'date_03', game: 'game_03' },
        { id: 'r_04', status: 'status_04', name: 'name_04', month: 'month_04', date: 'date_04', game: 'game_04' },
        { id: 'r_05', status: 'status_05', name: 'name_05', month: 'month_05', date: 'date_05', game: 'game_05' },
        { id: 'r_06', status: 'status_06', name: 'name_06', month: 'month_06', date: 'date_06', game: 'game_06' },
        { id: 'r_07', status: 'status_07', name: 'name_07', month: 'month_07', date: 'date_07', game: 'game_07' },
        { id: 'r_08', status: 'status_08', name: 'name_08', month: 'month_08', date: 'date_08', game: 'game_08' },
        { id: 'r_09', status: 'status_09', name: 'name_09', month: 'month_09', date: 'date_09', game: 'game_09' },
        { id: 'r_10', status: 'status_10', name: 'name_10', month: 'month_10', date: 'date_10', game: 'game_10' },
    ],
};

export default data;
