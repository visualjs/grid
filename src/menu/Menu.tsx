import Component from "@/grid/Component";
import { Coordinate, MenuItem } from "@/types";
import Item from './Item';

import styles from './menu.module.css';

interface Props {
    items?: MenuItem[];
    coord?: Coordinate;
    onMenuItemClicked?: () => void;
}

export class Menu extends Component<Props> {

    get coord(): Coordinate {
        if (this.props.coord) {
            return this.props.coord;
        }
        return { x: 0, y: 0 };
    }

    render() {
        return (
            <div style={{ left: this.coord.x, top: this.coord.y }} className={styles.menu}>
                {this.props.items.map(item => {
                    return <Item onClick={this.props.onMenuItemClicked} {...item} />;
                })}
            </div>
        );
    }

}

export default Menu;