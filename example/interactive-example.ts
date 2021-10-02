import { Grid } from '@/index';
import IndexRender from './renders/IndexRender';
import { showContainer } from './utils';

; (() => {

    const container = showContainer('#interactive-example-container', 'Interactive Example');
    const grid = new Grid(document.querySelector("#interactive-example"), {
        columns: [
            { headerName: '#', field: '#', pinned: 'left', width: 80, readonly: true, cellRender: IndexRender },
            { headerName: 'ID', field: 'id', pinned: 'left', width: 100, resizable: true },
            { headerName: 'Name', field: 'name', width: 120, resizable: true },
            { headerName: 'Age', field: 'age', width: 120, resizable: true },
        ],
        rows: [],
        rowHeight: 30,
        fillable: 'xy',
        getContextMenuItems: (params) => {

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
                { name: 'Enlarge', icon: 'vg-enlarge-simplicit' },
                { separator: true },
                {
                    name: 'Pin Current Column', icon: 'vg-pin', disabled: options.readonly, subMenus: [
                        { name: 'Pin Left', action: () => setColumnPinned('left'), icon: pinnedIcon('left') },
                        { name: 'Pin Right', action: () => setColumnPinned('right'), icon: pinnedIcon('right') },
                        { name: 'No Pin', action: () => setColumnPinned(), icon: pinnedIcon() },
                    ]
                },
                { separator: true },
                { name: 'Copy', icon: 'vg-copy', action: () => params.grid.copySelection() },
                { name: 'Paste', disabled: options.readonly, icon: 'vg-paste', action: () => params.grid.pasteFromClipboard() },
                { separator: true },
                {
                    name: 'Delete', disabled: options.readonly, icon: 'vg-trash-bin', action: () => {
                        params.grid.store('row').dispatch('takeRows', [params.row]);
                    }
                },
                { separator: true },
                { name: 'Download', icon: 'vg-download', disabled: true },
            ];
        }
    });

    const controls = document.createElement('div');
    container.appendChild(controls);

    controls.innerHTML = `
        <div style="width: 90%; margin: 0 auto;">
            Name: <input type="text" id="field-name" />
            Age: <input type="number" value="20" id="field-age" />
            <input type="button" id="add-row" value="Add Row" />
            <br />
            <br />
            <button class="loading">Toggle loading</button>
            <br />
            <br />
            <button class="small">Small</button>
            <button class="middle">Middle</button>
            <button class="large">Large</button>
        </div>
    `;

    let id = 0;
    controls.querySelector<HTMLButtonElement>('#add-row').addEventListener('click', () => {

        const name = controls.querySelector<HTMLInputElement>('#field-name');
        const age = controls.querySelector<HTMLInputElement>('#field-age');

        grid.appendRowsBefore(1, [{ id: String(id++), name: name.value, age: age.value }]);
    });

    controls.querySelector<HTMLButtonElement>('.small').addEventListener('click', () => {
        grid.setRowBaseHeight(20);
        grid.setColumnHeight(20);
    });

    controls.querySelector<HTMLButtonElement>('.middle').addEventListener('click', () => {
        grid.setRowBaseHeight(30);
        grid.setColumnHeight(30);
    });

    controls.querySelector<HTMLButtonElement>('.large').addEventListener('click', () => {
        grid.setRowBaseHeight(50);
        grid.setColumnHeight(50);
    });

    controls.querySelector<HTMLButtonElement>('.loading').addEventListener('click', () => {
        grid.setLoading(!grid.state('grid').loading);
    });
})();
