import { Grid } from '@/index';
import { RowData } from '@/types';
import { CheckboxRender, RatingRender, SelectionRender, HyperlinkRender } from '@/index';
import { name, country, game, date, numeric, month } from './fake';
import { monthOptions } from './fake';

; (() => {

    let rows: RowData[] = [];

    for (let i = 0; i < 10000; i++) {

        const countryData = country(i);

        rows.push({
            id: 'row_' + i,
            name: name(i),
            status: i % 2 == 0,
            month: [month(), month()],
            language: countryData.language,
            country: countryData.country,
            continent: countryData.continent,
            game: {title: game(i), link: "https://www.example.com"},
            bought: numeric(100) > 50,
            balance: numeric(10000),
            rating: numeric(10),
            winnings: numeric(100000),
            date: date(new Date(2021, 1), new Date(2021, 6)).toString(),
        });
    }

    new Grid(document.querySelector("#full-example"), {
        columns: [
            { headerName: 'ID', field: 'id', pinned: 'left', width: 100 },
            { headerName: 'Name', field: 'name', width: 120, resizable: true },
            { headerName: 'Status', field: 'status', width: 80, cellRender: CheckboxRender },
            { headerName: 'Month', field: 'month', cellRender: SelectionRender, cellRendererParams: { options: monthOptions } },
            { headerName: 'Game Name', field: 'game', cellRender: HyperlinkRender },
            { headerName: 'Language', field: 'language', width: 100, },
            { headerName: 'Country', field: 'country', resizable: true },
            { headerName: 'Continent', field: 'continent' },
            { headerName: 'Bought', field: 'bought', cellRender: CheckboxRender },
            { headerName: 'Bank Balance', field: 'balance' },
            { headerName: 'Rating', field: 'rating', pinned: 'left', cellRender: RatingRender },
            { headerName: 'Total Winnings', field: 'winnings' },
            { headerName: 'Date', field: 'date', pinned: 'right' },
        ],
        rows: rows,
        rowHeight: 30,
    });

})();