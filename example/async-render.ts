import { CellRenderer, CellRendererParams } from '@/grid/cell';
import { Grid } from '@/index';
import { RowData } from '@/types';
import { showContainer } from './utils';

; (() => {

    let rows: RowData[] = [];

    for (let i = 0; i < 10000; i++) {
        let data: RowData = {
            id: String(i),
        };

        for (let j = 1; j <= 20; j++) {
            data[String(j)] = `${i} - ${j}`;
        }

        rows.push(data);
    }

    class CustomCellRender extends CellRenderer<{}> {

        protected element: HTMLDivElement = document.createElement('div');

        public init(params: CellRendererParams<{}>) {
            this.element.innerHTML = params.value;
            var start = new Date();
            while ((new Date()).getTime() - start.getTime() < 3) { }
        }

        public gui(): HTMLElement {
            return this.element;
        }

    }

    showContainer('#async-render-container', 'Async Render');
    new Grid(document.querySelector("#async-render"), {
        columns: [
            { field: '1', headerName: '1' },
            { field: '2', headerName: '2' },
            { field: '3', headerName: '3' },
            { field: '4', headerName: '4' },
            { field: '5', headerName: '5' },
            { field: '6', headerName: '6' },
            { field: '7', headerName: '7' },
            { field: '8', headerName: '8' },
            { field: '9', headerName: '9' },
            { field: '10', headerName: '10' },
            { field: '11', headerName: '11' },
            { field: '12', headerName: '12' },
            { field: '13', headerName: '13' },
            { field: '14', headerName: '14' },
            { field: '15', headerName: '15' },
            { field: '16', headerName: '16' },
            { field: '17', headerName: '17' },
            { field: '18', headerName: '18' },
            { field: '19', headerName: '19' },
            { field: '20', headerName: '20' },
        ],
        defaultColumnOption: {
            width: 60,
            cellRender: CustomCellRender
        },
        rows: rows,
    });

})();
