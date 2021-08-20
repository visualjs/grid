import Row from "@/row";
import Component from "./Component";

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

    constructor(props: Props) {
        super(props);

        this.state = {
            startIndex: 0,
            endIndex: 0,
            // Set the cell container height according to the content height
            contentHeight: this.props.items.length * this.props.itemHeight
        }
    }

    componentDidMount() {
        this.update();
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

    render() {
        return (
            <div ref={this.createRef("container")} className={styles.listContainer} onScroll={this.update}>
                <div style={{ height: this.state.contentHeight }}></div>
                <div style={{ top: this.state.viewOffset }} className={styles.listView}>
                    {this.props.render(this.props.items.slice(this.state.startIndex, this.state.endIndex))}
                </div>
            </div>
        );
    }

}

export default List;
