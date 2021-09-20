import Component from "@/views/Component";
import { RefObject } from "preact";

import styles from './list.module.css';

interface Props {
    itemHeight: number;
    items: any[];
    preLoadCount?: number;
    render: (items: any[]) => JSX.Element;
    selfRef?: RefObject<HTMLDivElement>;
}

class List extends Component<Props> {

    protected io: IntersectionObserver;

    protected timer: number = null;

    constructor(props: Props) {
        super(props);

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
        this.setState({});
    }

    protected handleScroll = () => {
        clearTimeout(this.timer);
        setTimeout(this.update, 100);
    }

    render() {

        // Set the cell container height according to the content height
        const contentHeight = this.props.items.length * this.props.itemHeight;

        const clientHeight = this.props.selfRef?.current?.clientHeight;
        const scrollTop = this.props.selfRef?.current?.scrollTop;
        const itemSize = this.props.itemHeight;

        const visibleCount = Math.ceil(clientHeight / itemSize);
        const clientStartIndex = Math.floor(scrollTop / itemSize)
        const clientEndIndex = clientStartIndex + visibleCount;

        const startIndex = Math.max(0, clientStartIndex - this.props.preLoadCount);
        const endIndex = Math.min(this.props.items.length, clientEndIndex + this.props.preLoadCount);
        const viewOffset = startIndex * itemSize;

        return (
            <div ref={this.props.selfRef} className={styles.listContainer} onScroll={this.handleScroll}>
                <div style={{ height: contentHeight }}></div>
                <div style={{ top: viewOffset }} className={styles.listView}>
                    <div ref={this.createRef("start")}></div>
                    {this.props.render(this.props.items.slice(startIndex, endIndex))}
                    <div ref={this.createRef("end")}></div>
                </div>
            </div>
        );
    }

}

export default List;
