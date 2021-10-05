import { ColumnDef, ColumnGroupOptions, ColumnOptions, ColumnsDef, GroupData } from "@/types";
import { counter, unique } from "@/utils";

// Get the deepest grouping level
export function columnsDepth(columns: ColumnsDef, currentDepth = 1): number {

    var maxDepth = currentDepth;

    for (let i = 0; i < columns.length; i++) {
        const c = (columns[i] as ColumnGroupOptions);
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

    if (Array.isArray((column as ColumnGroupOptions).children)) {

        if ((column as ColumnGroupOptions).id === undefined) {
            (column as ColumnGroupOptions).id = String(id());
        }

        (column as ColumnGroupOptions).children = (column as ColumnGroupOptions).children.map(c => {
            return paddingColumn(c, level - 1, id);
        });

        return column;
    }

    return {
        id: String(id()),
        isPadding: true,
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
        const group = (c as ColumnGroupOptions);
        if (!Array.isArray(group.children)) {
            columns.push(c as ColumnOptions);
            return;
        }

        // Ignore groups without children
        if (group.children.length == 0) {
            return;
        }

        groups.push(group.id);

        const subResult = normalizedColumns(group.children);

        // Combine the current groupe data and the groupe data of the subset into the original data
        groupsData = Object.assign(groupsData, {[group.id]: {
            id: group.id,
            headerName: group.headerName,
            // The columns under the grouping include all the columns under the grouping subset
            columns: subResult.columns.map(c => c.field),
            groups: unique(subResult.groups.flat()),
            collapsed: group.collapsed,
            collapsible: group.collapsible,
        }}, subResult.groupsData);

        // If the group is collapsed,
        // hide all columns except the first column under the group
        if (group.collapsed) {
            subResult.columns.slice(1).forEach(c => {
                c.visible = false;
            })
        }

        columns = columns.concat(subResult.columns);

        if (subGroups.length == 0) {
            subGroups = subResult.groups;
        } else {
            subGroups = deepConcat(subGroups, subResult.groups);
        }
    });

    // all columns
    if (groups.length == 0) {
        return {groups: [], columns, groupsData};
    }

    return {
        groups: [groups, ...subGroups],
        columns,
        groupsData,
    };
}
