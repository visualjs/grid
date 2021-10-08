### v1.1.2 / 2021-10-08

- Fix in some cases, horizontal scrolling cannot be rolled to the end
- Fix cell editing popup is cropped
- Fix row re-rendering when scrolling
- Fix layout and style

### v1.1.1 / 2021-10-06

- Add dark theme
- Fix group collapsed error
- Fix column flex layout error
- Fix hide column menu icon when no menu items

### v1.1.0 / 2021-10-03

- Add collapsible column group
- Add hidden column api
- Add column menu
- Add pinned row
- Add custom style and class for cell or row
- Add columnOptionsSelector to override column options
- Add beforeDestroy hook in cell components
- Add UI event listener
- Fix the horizontal scroll bar from flickering when scrolling
- Fix cannot modify a read-only cell
- Fix popup is cropped by the grid
- Refactor grid api

### v1.0.5 / 2021-09-17

- Add destroy grid interface
- Add add setEditing and stopEditing actions
- Add Alobal loading
- Add menu edge check
- Fix the grid body does not display when there is no pinned column

### v1.0.4 / 2021-09-14

- Add getRowData and getRowDataByIndex action
- Add scroll horizontally through the touchpad in the table body

### v1.0.3 / 2021-09-08

- Add column flex layout and adaptive remaining width
- Add setBaseHeight dispatch to the row
- Add setHeight dispatch to the column
- Add appendSelectRows, takeSelectRow, appendRows action to the row
- Delete appendRows dispatch from row
- Fix add vendor prefixes to CSS rules by autoprefixer

### v1.0.2 / 2021-09-07

- Add takeRows dispatch to the row store
- Add appendRowsBefore dispatch to the row store
- Fix contextmenu position is wrong when the page is scrolled
- Fix shoule hide context menu when clickoutside
- Fix layout error
- Fix appendRows does not take effect

### v1.0.1 / 2021-09-06

- Fix npm publish error
- Update README.md

### v1.0.0 / 2021-09-06

- Column pinned
- Drag to adjust column width
- Virtual list
- Custom cell render
- Custom cell editor
- Range selection
- Copy and paste
- Drag to fill cells
- Context menu
