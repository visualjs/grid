export enum Alignment {
    AUTO = 'auto',
    START = 'start',
    CENTER = 'center',
    END = 'end',
}

export enum ScrollChangeReason {
    OBSERVED = 'observed',
    REQUESTED = 'requested',
}

export enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
}

export enum ScrollEventName {
    Vertical = 'onScrollVertical',
    Horizontal = 'onScrollHorizontal'
}

export const scrollEventProp = {
	[Direction.Vertical]: ScrollEventName.Vertical,
	[Direction.Horizontal]: ScrollEventName.Horizontal,
};

export enum ScrollPropName {
    Vertical = 'scrollTop',
    Horizontal = 'scrollLeft'
}

export const scrollProp = {
	[Direction.Vertical]: ScrollPropName.Vertical,
	[Direction.Horizontal]: ScrollPropName.Horizontal,
};

export enum PositionPropName {
    Vertical = 'top',
    Horizontal = 'left'
}

export const positionProp = {
	[Direction.Vertical]: PositionPropName.Vertical,
	[Direction.Horizontal]: PositionPropName.Horizontal,
};

export enum OffsetPropName {
    Vertical = 'offsetTop',
    Horizontal = 'offsetLeft'
}

export const offsetProp = {
	[Direction.Vertical]: OffsetPropName.Vertical,
	[Direction.Horizontal]: OffsetPropName.Horizontal,
};

export enum ScrollNodeName {
    Vertical = 'scrollYNode',
    Horizontal = 'scrollXNode'
}

export const scrollNode = {
	[Direction.Vertical]: ScrollNodeName.Vertical,
	[Direction.Horizontal]: ScrollNodeName.Horizontal,
};
