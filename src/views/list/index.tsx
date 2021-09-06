import Component from "@/views/Component";

import styles from './list.module.css';

interface Props {
    itemHeight: number;
    items: any[];
    preLoadCount?: number;
    render: (items: any[]) => JSX.Element;
}

interface State {
    startIndex: number;
    endIndex: number;
    contentHeight?: number;
    viewOffset?: number;
}

class List extends Component<Props, State> {

    protected io: IntersectionObserver;

    protected timer: number = null;

    constructor(props: Props) {
        super(props);

        this.state = {
            startIndex: 0,
            endIndex: 0,
            // Set the cell container height according to the content height
            contentHeight: this.props.items.length * this.props.itemHeight
        }

        this.io = new IntersectionObserver((entries) => {
            this.update();
        })
    }

    componentDidMount = () => {
        this.update();
        this.io.observe(this.refs.start.current);
        this.io.observe(this.refs.end.current);
    }

    componentWillUnmount = () => {
        this.io.disconnect();
    }

    protected update = () => {
        const clientHeight = this.refs.container.current.clientHeight;
        const scrollTop = this.refs.container.current.scrollTop;
        const itemSize = this.props.itemHeight;

        const visibleCount = Math.ceil(clientHeight / itemSize);
        const clientStartIndex = Math.floor(scrollTop / itemSize)
        const clientEndIndex = clientStartIndex + visibleCount;

        const startIndex = Math.max(0, clientStartIndex - this.props.preLoadCount);
        const endIndex = Math.min(this.props.items.length, clientEndIndex + this.props.preLoadCount);

        this.setState({
            startIndex: startIndex,
            endIndex: endIndex,
            viewOffset: startIndex * itemSize
        });
    }

    protected handleScroll = () => {
        clearTimeout(this.timer);
        setTimeout(this.update, 100);
    }

    render() {
        return (
            <div ref={this.createRef("container")} className={styles.listContainer} onScroll={this.handleScroll}>
                <div style={{ height: this.state.contentHeight }}></div>
                <div style={{ top: this.state.viewOffset }} className={styles.listView}>
                    <div ref={this.createRef("start")}></div>
                    {this.props.render(this.props.items.slice(this.state.startIndex, this.state.endIndex))}
                    <div ref={this.createRef("end")}></div>
                </div>
            </div>
        );
    }

}

export default List;
