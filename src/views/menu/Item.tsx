import Component from "@/views/Component";
import { Coordinate, MenuItem } from "@/types";
import Menu from "./Menu";

import styles from './menu.module.css';

interface Props extends MenuItem {
    onClick?: (ev?: MouseEvent) => void;
}

interface State {
    subMenuVisible?: boolean;
    subMenuCoord?: Coordinate;
}

export class Item extends Component<Props, State> {

    protected get hasSubMenus() {
        return this.props.subMenus && !this.props.disabled;
    }

    protected handleClick = (ev: MouseEvent) => {
        if (this.props.disabled || this.props.subMenus) {
            return;
        }

        this.props.action && this.props.action();
        this.props.onClick && this.props.onClick(ev);
    }

    protected showSubMenus = () => {
        const self = this.refs.self.current;
        const react = self.getBoundingClientRect();
        const coord = { x: react.x + self.offsetWidth - 2, y: react.y };

        this.setState({
            subMenuCoord: coord,
            subMenuVisible: true,
        });
    }

    protected hideSubMenus = () => {
        this.setState({ subMenuVisible: false });
    }

    render() {
        if (this.props.separator) {
            return <div className={styles.menuSeparator}></div>;
        }

        return (
            <div
                className={this.props.disabled ? styles.menuDisabledItem : styles.menuItem}
                onClick={this.handleClick}
                onMouseOver={this.hasSubMenus ? this.showSubMenus : undefined}
                onMouseLeave={this.hasSubMenus ? this.hideSubMenus : undefined}
                ref={this.createRef('self')}
            >
                <span className={styles.menuItemIcon}>
                    <span className={this.props.icon}></span>
                </span>
                <span className={styles.menuItemTitle}>{this.props.name}</span>
                {this.hasSubMenus && <span className="vg-cheveron-right"></span>}
                {this.state.subMenuVisible && <Menu
                    onMenuItemClicked={this.props.onClick}
                    coord={this.state.subMenuCoord}
                    items={this.props.subMenus}
                />}
            </div>
        );
    }
}

export default Item;
