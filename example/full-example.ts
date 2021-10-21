import { Grid } from '@/index';
import { ColumnsDef, RowData } from '@/types';
import { name, country, game, date, numeric, month } from './fake';
import { monthOptions, languageOptions } from './fake';
import IndexRender from './renders/IndexRender';
import { CheckboxRender, RatingRender, SelectionRender, HyperlinkRender } from '@/components';
import { RatingEditor, InputEditor, CheckboxEditor, SelectionEditor } from '@/components';
import { BooleanTransformer, SelectionTransformer } from '@/components';
import { showContainer } from './utils';

; (() => {

    let rows: RowData[] = [];
    let columns: ColumnsDef = [
        { headerName: '#', field: '#', width: 80, readonly: true, pinned: 'left', rowDragable: true, cellRender: IndexRender },
        { headerName: 'ID', field: 'id', width: 100, pinned: 'left', resizable: true },
    ];

    const columnIteration = 10;

    for (let i = 0; i < 2000; i++) {

        const countryData = country(i);
        let rowData: RowData = { id: 'row_' + i };

        for (let c = 0; c < columnIteration; c++) {
            rowData = Object.assign({}, rowData, {
                [`name_${c}`]: name(i),
                [`status_${c}`]: i % 2 == 0,
                [`month_${c}`]: [month(), month()],
                [`language_${c}`]: [countryData.language],
                [`country_${c}`]: countryData.country,
                [`continent_${c}`]: countryData.continent,
                [`game_${c}`]: { title: game(i), link: "https://www.example.com" },
                [`bought_${c}`]: numeric(100) > 50,
                [`balance_${c}`]: numeric(10000),
                [`rating_${c}`]: numeric(10),
                [`winnings_${c}`]: numeric(100000),
                [`date_${c}`]: date(new Date(2021, 1), new Date(2021, 6)).toString(),
            });
        }

        rows.push(rowData);
    }

    for (let c = 0; c < columnIteration; c++) {

        const pinnedRight = c === 0 ? 'right' : undefined;

        columns = columns.concat([
            { headerName: 'Name', field: `name_${c}`, width: 120, resizable: true, cellEditor: InputEditor },
            {
                headerName: 'Status', field: `status_${c}`, width: 80, resizable: true,
                transformer: new BooleanTransformer(),
                cellRender: CheckboxRender, cellEditor: CheckboxEditor
            },
            {
                headerName: 'Month', field: `month_${c}`, resizable: true, rowDragable: true,
                transformer: new SelectionTransformer({
                    allowNotExistOption: false, options: Object.keys(monthOptions)
                }),
                cellRender: SelectionRender,
                cellEditor: SelectionEditor,
                cellParams: { options: monthOptions, multiple: true }
            },
            { headerName: 'Game Name', field: `game_${c}`, resizable: true, cellRender: HyperlinkRender },
            {
                headerName: 'Language', field: `language_${c}`, width: 100, resizable: true,
                transformer: new SelectionTransformer({
                    allowNotExistOption: false, options: Object.keys(languageOptions)
                }),
                cellRender: SelectionRender,
                cellEditor: SelectionEditor,
                cellParams: { options: languageOptions },
            },
            { headerName: 'Country', field: `country_${c}`, resizable: true },
            { headerName: 'Continent', field: `continent_${c}`, resizable: true },
            { headerName: 'Bought', field: `bought_${c}`, resizable: true, cellRender: CheckboxRender },
            {
                headerName: 'Bank Balance', field: `balance_${c}`, resizable: true,
                cellEditor: InputEditor,
                cellParams: { type: 'number' }
            },
            {
                headerName: 'Rating', field: `rating_${c}`, resizable: true,
                cellRender: RatingRender,
                cellEditor: RatingEditor
            },
            {
                headerName: 'Total Winnings', field: `winnings_${c}`, resizable: true,
                cellEditor: InputEditor,
                cellParams: { type: 'number' }
            },
            { headerName: 'Date', field: `date_${c}`, pinned: pinnedRight, resizable: true },
        ]);
    }

    showContainer('#full-example-container', 'Full Example');
    const container = document.querySelector<HTMLDivElement>("#full-example");
    container.style.height = '680px';
    const grid = new Grid(container, {
        columns: columns,
        defaultColumnOption: {
            minWidth: 100
        },
        rows: [],
        rowHeight: 40,
        fillable: 'xy',
        overscanRowCount: 5,
        overscanColumnCount: 3,
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

            const setRowsPinned = (pinned?: 'top' | 'bottom') => {
                if (pinned == 'top') {
                    params.grid.appendPinnedTopRows(params.grid.getSelectedRows());
                } else if (pinned == 'bottom') {
                    params.grid.appendPinnedBottomRows(params.grid.getSelectedRows());
                } else {
                    params.grid.takePinnedRows(params.grid.getSelectedRows());
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
                        { name: 'Pin Top', action: () => setRowsPinned('top'), icon: pinnedTopRowIcon() },
                        { name: 'Pin Bottom', action: () => setRowsPinned('bottom'), icon: pinnedBottomRowIcon() },
                        { name: 'No Pin', action: () => setRowsPinned(), icon: noPinnedRowIcon() },
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
    grid.setPinnedTopRows(['row_1', 'row_3', 'row_5']);
    grid.setPinnedBottomRows(['row_2', 'row_4']);
})();
