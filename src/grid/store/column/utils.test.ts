import { Transformer } from "@/grid/data.mock";
import { ColumnDef, ColumnsDef } from "@/types";
import { columnsDepth, paddingColumns, paddingColumn, normalizedColumns, cloneColumnsDef } from "./utils";

describe('cloneColumnsDef', () => {
    test('clone', () => {
        const trans = new Transformer();
        const getCellClass = () => {
            return ['cell'];
        }

        const defs: any = [
            { field: 'id', pinned: 'left', getCellClass: getCellClass},
            { field: 'name', transformer: trans },
            {
                id: 'group_01', children: [
                    { field: 'status', pinned: 'left', transformer: trans },
                    { field: 'month' },
                ]
            },
            { field: 'game', pinned: 'right' },
            { field: 'date' }
        ];

        const newDefs: any = cloneColumnsDef(defs);
        defs[0].headerName = "id";
        defs[2].children[0].field = 'new status';

        expect(newDefs).not.toBe(defs);
        expect(newDefs[0].getCellClass).toBe(getCellClass);
        expect(newDefs[0].headerName).toBe(undefined);
        expect(newDefs[1].transformer).toBe(trans);
        expect(newDefs[2]['children'][0].field).toBe('status');
        expect(newDefs[2]['children'][0].transformer).toBe(trans);
    });
});

describe('columnsDepth', () => {

    test('1 levels', () => {
        const input: ColumnsDef = [
            { headerName: 'Name', field: 'name' },
            { headerName: 'Bought', field: 'bought', children: [] },
        ];

        expect(columnsDepth(input)).toBe(1);
    });

    test('2 levels', () => {
        const input: ColumnsDef = [
            { headerName: 'Name', field: 'name' },
            {
                headerName: 'Bought', children: [
                    { headerName: 'Game', field: 'game' },
                ]
            },
        ];

        expect(columnsDepth(input)).toBe(2);
    });

    test('3 levels', () => {
        const input: ColumnsDef = [
            {
                headerName: 'Group 1', children: [
                    { headerName: 'Name', field: 'name' },
                ]
            },
            {
                headerName: 'Group 2', children: [
                    { headerName: 'Country', field: 'country' },
                    {
                        headerName: 'Group 2-1', children: [
                            { headerName: 'Game', field: 'game' },
                        ],
                    }
                ],
            },
            { headerName: 'Bought', field: 'bought' },
        ];

        expect(columnsDepth(input)).toBe(3);
    });
});

describe('padingColumn', () => {

    test('add one layer of padding', () => {
        const input: ColumnDef = {
            headerName: 'Group 1', children: [
                { headerName: 'Name', field: 'name' },
                { headerName: 'Age', field: 'age' },
                {
                    headerName: 'Group 2', children: [
                        { headerName: 'Score', field: 'score' },
                    ]
                },
            ]
        };

        expect(paddingColumn(input, 3)).toStrictEqual({
            id: '0', headerName: 'Group 1', children: [
                {
                    id: '1', headerName: '', isPadding: true, children: [
                        { headerName: 'Name', field: 'name' },
                    ]
                },
                {
                    id: '2', headerName: '', isPadding: true, children: [
                        { headerName: 'Age', field: 'age' },
                    ]
                },
                {
                    id: '3', headerName: 'Group 2', children: [
                        { headerName: 'Score', field: 'score' },
                    ]
                }
            ]
        });
    });

    test('add tow layers of padding', () => {
        const input: ColumnDef = { headerName: 'Name', field: 'name' };

        expect(paddingColumn(input, 3)).toStrictEqual({
            id: '0', headerName: '', isPadding: true, children: [
                {
                    id: '1', headerName: '', isPadding: true, children: [
                        { headerName: 'Name', field: 'name' },
                    ]
                }
            ]
        });
    });

});

describe('paddingColumns', () => {

    test('3 levels', () => {

        const input: ColumnsDef = [
            {
                headerName: 'Group 1', children: [
                    { headerName: 'Name', field: 'name' },
                ]
            },
            {
                headerName: 'Group 2', children: [
                    { headerName: 'Country', field: 'country' },
                    {
                        headerName: 'Group 2-1', children: [
                            { headerName: 'Game', field: 'game' },
                        ],
                    }
                ],
            },
            { headerName: 'Bought', field: 'bought' },
        ];

        expect(paddingColumns(input)).toStrictEqual([
            {
                id: '0', headerName: 'Group 1', children: [
                    {
                        id: '1',
                        headerName: '', isPadding: true,
                        children: [
                            { headerName: 'Name', field: 'name' },
                        ]
                    }
                ]
            },
            {
                id: '2', headerName: 'Group 2', children: [
                    {
                        id: '3',
                        headerName: '', isPadding: true,
                        children: [
                            { headerName: 'Country', field: 'country' },
                        ]
                    },
                    {
                        id: '4', headerName: 'Group 2-1', children: [
                            { headerName: 'Game', field: 'game' },
                        ],
                    }
                ],
            },
            {
                id: '5', headerName: '', isPadding: true,
                children: [
                    {
                        id: '6', headerName: '', isPadding: true, children: [
                            { headerName: 'Bought', field: 'bought' },
                        ]
                    }
                ]
            },
        ]);
    });

});

describe('normalizedColumns', () => {

    test('', () => {

        const input: ColumnsDef = [
            {
                headerName: 'Group 1', children: [
                    { headerName: 'Name', field: 'name' },
                ]
            },
            {
                headerName: 'Group 2', collapsed: true, children: [
                    { headerName: 'Country', field: 'country' },
                    {
                        headerName: 'Group 2-1', children: [
                            { headerName: 'Game', field: 'game' },
                        ],
                    }
                ],
            },
            { headerName: 'Bought', field: 'bought' },
        ];

        const result = normalizedColumns(paddingColumns(input));

        expect(result.columns.length).toBe(4);
        expect(result.columns[0].field).toBe('name');
        expect(result.columns[1].field).toBe('country');
        expect(result.columns[2].field).toBe('game');
        expect(result.columns[2].visible).toBeFalsy();
        expect(result.columns[3].field).toBe('bought');

        expect(result.groups.length).toBe(2);
        expect(result.groups).toStrictEqual([
            ['0', '2', '5'],
            ['1', '3', '4', '6']
        ]);

        expect(Object.keys(result.groupsData).length).toBe(7);
        expect(result.groupsData['0'].columns).toStrictEqual(['name']);
        expect(result.groupsData['0'].groups).toStrictEqual(['1']);
        expect(result.groupsData['1'].columns).toStrictEqual(['name']);
        expect(result.groupsData['1'].groups).toStrictEqual([]);
        expect(result.groupsData['2'].columns).toStrictEqual(['country', 'game']);
        expect(result.groupsData['2'].groups).toStrictEqual(['3', '4']);
        expect(result.groupsData['2'].collapsed).toBeTruthy();
    });

});
