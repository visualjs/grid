import { ColumnDef, ColumnGroup, ColumnOptions, ColumnsDef, GroupData } from "@/types";
import { counter } from "@/utils";

// Get the deepest grouping level
export function columnsDepth(columns: ColumnsDef, currentDepth = 1): number {

    var maxDepth = currentDepth;

    for (let i = 0; i < columns.length; i++) {
        const c = (columns[i] as ColumnGroup);
        // has children
        if (Array.isArray(c.children) && c.children.length > 0) {
            const depth = columnsDepth(c.children, currentDepth + 1);
            if (depth > maxDepth) {
                maxDepth = depth;
            }
        }
    }

    return maxDepth;
}

// Fill the column with empty grouping according to the specified number of layers
export function paddingColumn(column: ColumnDef, level: number, id?: () => number): ColumnDef {

    if (id == undefined) {
        id = counter();
    }

    if (level == 1) {
        return column;
    }

    if (Array.isArray((column as ColumnGroup).children)) {

        if ((column as ColumnGroup).id === undefined) {
            (column as ColumnGroup).id = String(id());
        }

        (column as ColumnGroup).children = (column as ColumnGroup).children.map(c => {
            return paddingColumn(c, level - 1, id);
        });

        return column;
    }

    return {
        id: String(id()),
        headerName: '',
        children: [
            paddingColumn(column, level - 1, id)
        ]
    };
}

export function paddingColumns(columns: ColumnsDef): ColumnsDef {

    const depth = columnsDepth(columns);
    const id = counter();

    return columns.map(c => {
        return paddingColumn(c, depth, id);
    });
}

export function deepConcat<T>(dist: T[][], src: T[][]) {
   return dist.map((_, i) => {
       return dist[i].concat(src[i]);
   });
}

// Separate and standardize column groups and column options
export function normalizedColumns(columnsDef: ColumnsDef): {
    columns: ColumnOptions[],
    groups: string[][],
    groupsData: Record<string, GroupData>,
} {

    let groups: string[] = [];
    let groupsData: Record<string, GroupData> = {};
    let columns: ColumnOptions[] = [];
    let subGroups: string[][] = [];

    columnsDef.forEach((c) => {
        const group = (c as ColumnGroup);
        if (!Array.isArray(group.children)) {
            columns.push(c as ColumnOptions);
            return;
        }

        if (group.children.length == 0) {
            return;
        }

        groups.push(group.id);

        const subResult = normalizedColumns(group.children);

        groupsData = Object.assign(groupsData, {[group.id]: {
            id: group.id,
            headerName: group.headerName,
            columns: subResult.columns.map(c => c.field),
            collapsed: group.collapsed,
            collapsible: group.collapsible,
        }}, subResult.groupsData);

        if (group.collapsed) {
            subResult.columns.forEach((c, i) => {
                if (i !== 0) {
                    c.visible = false;
                }
            })
        }

        columns = columns.concat(subResult.columns);

        if (subGroups.length == 0) {
            subGroups = subResult.groups;
        } else {
            subGroups = deepConcat(subGroups, subResult.groups);
        }
    });

    if (groups.length == 0) {
        return {groups: [], columns, groupsData};
    }

    return {
        groups: [groups, ...subGroups],
        columns,
        groupsData,
    };
}
