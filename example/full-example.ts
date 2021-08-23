import { Grid } from '@/index';
import { RowData } from '@/types';
import { RatingRender } from './renders';
import { name, country, game, date, numeric } from './fake';

; (() => {

    let rows: RowData[] = [];

    for (let i = 0; i < 10000; i++) {

        const countryData = country(i);

        rows.push({
            id: 'row_' + i,
            name: name(i),
            language: countryData.language,
            country: countryData.country,
            continent: countryData.continent,
            game: game(i),
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
            { headerName: 'Language', field: 'language', width: 100, },
            { headerName: 'Country', field: 'country', resizable: true },
            { headerName: 'Continent', field: 'continent' },
            { headerName: 'Game Name', field: 'game', pinned: 'left' },
            { headerName: 'Bought', field: 'bought' },
            { headerName: 'Bank Balance', field: 'balance' },
            { headerName: 'Rating', field: 'rating', pinned: 'left', cellRender: RatingRender },
            { headerName: 'Total Winnings', field: 'winnings' },
            { headerName: 'Date', field: 'date', pinned: 'right' },
        ],
        rows: rows,
        rowHeight: 30,
        headerHeight: 38,
    });

})();