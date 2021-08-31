import Component from "@/grid/Component";
import { Coordinate, MenuItem } from "@/types";
import Menu from "./Menu";

import styles from './menu.module.css';

interface Props extends MenuItem {
    onClick?: () => void;
}

interface State {
    subMenuVisible?: boolean;
    subMenuCoord?: Coordinate;
}

export class Item extends Component<Props, State> {

    protected handleClick = () => {
        if (this.props.disabled || this.props.subMenus) {
            return;
        }

        this.props.action && this.props.action();
        this.props.onClick && this.props.onClick();
    }

    protected showSubMenus = () => {
        const self = this.refs.self.current;
        const react = self.getBoundingClientRect();
        this.setState({
            subMenuCoord: { x: react.x + self.offsetWidth - 2, y: react.y },
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
                onMouseOver={this.props.subMenus ? this.showSubMenus : undefined}
                onMouseLeave={this.props.subMenus ? this.hideSubMenus : undefined}
                ref={this.createRef('self')}
            >
                <span className={styles.menuItemIcon}>
                    <span className={this.props.icon}></span>
                </span>
                <span className={styles.menuItemTitle}>{this.props.name}</span>
                {this.props.subMenus && <span className="vg-cheveron-right"></span>}
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
