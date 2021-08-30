import { Grid } from '@/index';
import { RowData } from '@/types';
import { name, country, game, date, numeric, month } from './fake';
import { monthOptions, languageOptions } from './fake';
import { CheckboxRender, RatingRender, SelectionRender, HyperlinkRender } from '@/components';
import { RatingEditor, InputEditor, CheckboxEditor, SelectionEditor } from '@/components';
import { BooleanTransformer, SelectionTransformer } from '@/components';

; (() => {

    let rows: RowData[] = [];

    for (let i = 0; i < 10000; i++) {

        const countryData = country(i);

        rows.push({
            id: 'row_' + i,
            name: name(i),
            status: i % 2 == 0,
            month: [month(), month()],
            language: [countryData.language],
            country: countryData.country,
            continent: countryData.continent,
            game: { title: game(i), link: "https://www.example.com" },
            bought: numeric(100) > 50,
            balance: numeric(10000),
            rating: numeric(10),
            winnings: numeric(100000),
            date: date(new Date(2021, 1), new Date(2021, 6)).toString(),
        });
    }

    const grid = new Grid(document.querySelector("#full-example"), {
        columns: [
            { headerName: 'ID', field: 'id', pinned: 'left', width: 100, resizable: true },
            { headerName: 'Name', field: 'name', width: 120, resizable: true, cellEditor: InputEditor },
            {
                headerName: 'Status', field: 'status', width: 80, resizable: true,
                transformer: new BooleanTransformer(),
                cellRender: CheckboxRender, cellEditor: CheckboxEditor
            },
            {
                headerName: 'Month', field: 'month', resizable: true,
                transformer: new SelectionTransformer({
                    allowNotExistOption: false, options: Object.keys(monthOptions)
                }),
                cellRender: SelectionRender,
                cellEditor: SelectionEditor,
                cellParams: { options: monthOptions, multiple: true }
            },
            { headerName: 'Game Name', field: 'game', resizable: true, cellRender: HyperlinkRender },
            {
                headerName: 'Language', field: 'language', width: 100, resizable: true,
                transformer: new SelectionTransformer({
                    allowNotExistOption: false, options: Object.keys(languageOptions)
                }),
                cellRender: SelectionRender,
                cellEditor: SelectionEditor,
                cellParams: { options: languageOptions },
            },
            { headerName: 'Country', field: 'country', resizable: true },
            { headerName: 'Continent', field: 'continent', resizable: true },
            { headerName: 'Bought', field: 'bought', resizable: true, cellRender: CheckboxRender },
            {
                headerName: 'Bank Balance', field: 'balance', resizable: true,
                cellEditor: InputEditor,
                cellParams: { type: 'number' }
            },
            {
                headerName: 'Rating', field: 'rating', pinned: 'left', resizable: true,
                cellRender: RatingRender,
                cellEditor: RatingEditor
            },
            {
                headerName: 'Total Winnings', field: 'winnings', resizable: true,
                cellEditor: InputEditor,
                cellParams: { type: 'number' }
            },
            { headerName: 'Date', field: 'date', resizable: true, pinned: 'right' },
        ],
        rows: rows,
        rowHeight: 30,
        fillable: 'xy',
    });

    grid.addListener('cellValueChanged', (ev) => {
        console.log(ev);
    });
})();
