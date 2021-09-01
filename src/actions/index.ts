import Grid from "@/grid";
import { readTextFromClipboard, writeTextToClipboard } from "@/utils";

// Copy the currently selected cell data to the clipboard
export function copySelection(grid: Grid) {
    let text = '';
    grid.getSelectionRanges().forEach((range) => {
        let lastRow = -1;
        range.each(coord => {
            if (lastRow !== -1) {
                text += coord.y !== lastRow ? '\n' : '\t';
            }

            text += grid.getCellValueByCoord(coord);
            lastRow = coord.y;
        });
    })

    writeTextToClipboard(text);
}

// Parse the data from the clipboard and
// set the selected cell data according to the order
export function pasteFromClipboard(grid: Grid) {
    const start = grid.getSelectionRanges()[0]?.start;
    if (!start) return;

    readTextFromClipboard().then(str => {
        str = str.replace(/(\r\n|\r|\n)/g, '\n');
        str.split('\n').forEach((rowData, y) => {
            rowData.split('\t').forEach((value, x) => {
                const coord = { x: x + start.x, y: y + start.y };
                grid.setCellValueByCoord(coord, value);
            });
        });
    });
}
