export abstract class Component<T> {

    // Return the DOM element of your component, this is what the grid puts into the DOM
    public abstract gui(): HTMLElement;

    // A hook to perform any necessary operation just after the GUI for this component has been rendered
    // on the screen.
    public afterAttached?(): void;

    // This method is called on the component once.
    public init?(params: T): Promise<void> | void;
}

export default Component;
