import Component from "@/views/Component";
import { Coordinate, MenuItem } from "@/types";
import Item from './Item';
import { DOM } from "@/utils";

import styles from './menu.module.css';

interface Props {
    items?: MenuItem[];
    coord?: Coordinate;
    onMenuItemClicked?: (ev?: MouseEvent) => void;
    onClickOutside?: () => void;
}

export class Menu extends Component<Props> {

    get coord(): Coordinate {
        if (this.props.coord) {
            return this.props.coord;
        }
        return { x: 0, y: 0 };
    }

    componentDidMount = () => {
        document.addEventListener('click', this.handleClickoutside);
        this.edgeCheck();
    }

    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleClickoutside);
    }

    componentDidUpdate = () => {
        this.edgeCheck();
    }

    protected edgeCheck() {
        if (!DOM.isInViewport(this.refs.self.current)) {
            const left = this.coord.x - this.refs.self.current.offsetWidth + 'px';
            this.refs.self.current.style.left = left;
        }

        if (!DOM.isInViewport(this.refs.self.current)) {
            const top = this.coord.y - this.refs.self.current.offsetHeight + 'px';
            this.refs.self.current.style.top = top;
        }
    }
    protected handleClickoutside = (ev: MouseEvent) => {
        if (this.props.onClickOutside && !this.refs.self.current.contains(ev.target as Node)) {
            this.props.onClickOutside();
        }
    }

    render() {
        return (
            <div ref={this.createRef('self')} style={{ left: this.coord.x, top: this.coord.y }} className={styles.menu}>
                {this.props.items.map(item => {
                    return <Item onClick={this.props.onMenuItemClicked} {...item} />;
                })}
            </div>
        );
    }

}

export default Menu;
