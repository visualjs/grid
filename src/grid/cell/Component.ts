export abstract class Component<T> {
    // Return the DOM element of your component, this is what the grid puts into the DOM
    public abstract gui(): HTMLElement;

    //  Return a Dom Element of you component when cell is selected and readonly
    public readOnlySelectedGui?(params: T): HTMLElement;

    // A hook to perform any necessary operation just after the GUI for this component has been rendered
    // on the screen.
    public afterAttached?(): void;

    // A hook that performs any necessary operations before this component is destroyed.
    public beforeDestroy?(): void;

    // This method is called on the component once.
    public init?(params: T): Promise<void> | void;
}

export default Component;
