import Component, { h } from "@/component";
import GridElement from "./GridElement";

import styles from './list.module.css';

interface Props {
    itemHeight: number;
    items: any[];
    render: ItemRender;
}

type ItemRender = (item: any) => JSX.Element;

class ListView extends Component<{ render: ItemRender }> {

    protected items: any[] = [];

    public setItems = (items: any[]) => {
        this.items = items;
        this.update();
    }

    render() {
        return (
            <div className={styles.listView}>
                {this.items.map(item => this.props.render(item))}
            </div>
        );
    }

}

class List extends GridElement<Props> {

    protected view: ListView;

    componentDidMount = () => {
        // Set the cell container height according to the content height
        const contentHeight = this.props.items.length * this.props.itemHeight + 'px';
        this.refs.phantom.style.height = contentHeight;

        this.view = (this.instances.view as ListView);
    }

    protected handleVerticalScroll = (ev: UIEvent) => {
        const clientHeight = this.refs.container.clientHeight;
        const scrollTop = this.refs.container.scrollTop;
        const itemSize = this.props.itemHeight;

        const visibleCount = Math.ceil(clientHeight / itemSize);
        const startIndex = Math.floor(scrollTop / itemSize);
        const endIndex = startIndex + visibleCount;

        this.view.setItems(this.props.items.slice(startIndex, endIndex));
        this.refs.view.style.top = scrollTop - (scrollTop % itemSize) + 'px';
    }

    render() {
        return (
            <div className={styles.listContainer} ref={this.createRef("container")} onScroll={this.handleVerticalScroll}>
                <div ref={this.createRef("phantom")}></div>
                <ListView ref={this.createRef("view")} render={this.props.render} />
            </div>
        );
    }

}

export default List;
