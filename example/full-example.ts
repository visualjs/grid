import { Grid } from '@/index';
import { RowData } from '@/types';
import { name, country, game, date, numeric, month } from './fake';
import { monthOptions, languageOptions } from './fake';
import IndexRender from './renders/IndexRender';
import { CheckboxRender, RatingRender, SelectionRender, HyperlinkRender } from '@/components';
import { RatingEditor, InputEditor, CheckboxEditor, SelectionEditor } from '@/components';
import { BooleanTransformer, SelectionTransformer } from '@/components';
import { showContainer } from './utils';

; (() => {

    let rows: RowData[] = [];

    for (let i = 0; i < 100; i++) {

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

    showContainer('#full-example-container', 'Full Example');
    const grid = new Grid(document.querySelector("#full-example"), {
        columns: [
            { headerName: '#', field: '#', pinned: 'left', width: 80, readonly: true, cellRender: IndexRender },
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
        rows: [],
        rowHeight: 30,
        fillable: 'xy',
        getColumnMenuItems: (params) => {
            const options = params.grid.getColumnOptions(params.column);

            const setColumnPinned = (pinned?: 'left' | 'right') => {
                params.grid.setColumnPinned(params.column, pinned);
            }

            const pinnedIcon = (pinned?: 'left' | 'right') => {
                if (pinned === options.pinned) {
                    return 'vg-checkmark';
                }
            }

            return [
                {
                    name: 'Pin Current Column', icon: 'vg-pin', disabled: options.readonly, subMenus: [
                        { name: 'Pin Left', action: () => setColumnPinned('left'), icon: pinnedIcon('left') },
                        { name: 'Pin Right', action: () => setColumnPinned('right'), icon: pinnedIcon('right') },
                        { name: 'No Pin', action: () => setColumnPinned(), icon: pinnedIcon() },
                    ],
                },
                {
                    name: 'Flex', icon: options.flex ? 'vg-checkmark' : '', action: () => {
                        params.grid.setColumnWidth(params.column, { flex: Number(!options.flex) });
                    }
                },
                {
                    name: 'Visible', icon: options.visible ? 'vg-checkmark' : '', action: () => {
                        params.grid.setColumnVisible(params.column, false);
                    }
                }
            ];
        },
        getContextMenuItems: (params) => {

            const options = params.grid.getColumnOptions(params.column);

            const setRowPinned = (pinned?: 'top' | 'bottom') => {
                if (pinned == 'top') {
                    params.grid.appendPinnedTopRows([params.row]);
                } else {
                    params.grid.appendPinnedBottomRows([params.row]);
                }
            }

            const pinnedTopRowIcon = () => {
                return params.grid.isPinnedTop(params.row) ? 'vg-checkmark' : '';
            }
            const pinnedBottomRowIcon = () => {
                return params.grid.isPinnedBottom(params.row) ? 'vg-checkmark' : '';
            }
            const noPinnedRowIcon = () => {
                return !params.grid.isPinnedRow(params.row) ? 'vg-checkmark' : '';
            }

            return [
                { name: 'Enlarge', icon: 'vg-enlarge-simplicit' },
                { separator: true },
                {
                    name: 'Pin Current Row', icon: 'vg-pin', subMenus: [
                        { name: 'Pin Top', action: () => setRowPinned('top'), icon: pinnedTopRowIcon() },
                        { name: 'Pin Bottom', action: () => setRowPinned('bottom'), icon: pinnedBottomRowIcon() },
                        { name: 'No Pin', action: () => setRowPinned(), icon: noPinnedRowIcon() },
                    ]
                },
                { separator: true },
                { name: 'Copy', icon: 'vg-copy', action: () => params.grid.copySelection() },
                { name: 'Paste', disabled: options.readonly, icon: 'vg-paste', action: () => params.grid.pasteFromClipboard() },
                { separator: true },
                {
                    name: 'Delete', disabled: options.readonly, icon: 'vg-trash-bin', action: () => {
                        params.grid.removeRows([params.row]);
                    }
                },
                { separator: true },
                { name: 'Download', icon: 'vg-download', disabled: true },
            ];
        }
    });

    grid.on('cellValueChanged', (cell, value) => {
        console.log(cell, value);
    });

    grid.on('rowRemoved', (row) => {
        console.log(row + ' - ' + 'removed!');
    });

    grid.appendRows(rows);
    grid.setPinnedTopRows(['row_1', 'row_3', 'row_5', 'row_7']);
})();
