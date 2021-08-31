import Component from "@/grid/Component";
import { MenuItem } from "@/types";

import styles from './menu.module.css';

interface Props extends MenuItem {
    onClick?: () => void;
}

export class Item extends Component<Props> {

    get icon() {
        if ('string' === typeof this.props.icon) {
            return <span className={this.props.icon}></span>;
        }

        return this.props.icon;
    }

    protected handleClick = () => {
        if (this.props.disabled) {
            return;
        }

        this.props.action && this.props.action();
        this.props.onClick && this.props.onClick();
    }

    render() {
        if (this.props.separator) {
            return <div className={styles.menuSeparator}></div>;
        }

        return (
            <div onClick={this.handleClick} className={this.props.disabled ? styles.menuDisabledItem : styles.menuItem}>
                <span className={styles.menuItemIcon}>{this.icon}</span>
                <span>{this.props.name}</span>
            </div>
        );
    }
}

export default Item;
