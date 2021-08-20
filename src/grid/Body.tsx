import { RowData } from "@/types";
import Row from "@/row";
import GridElement from "./GridElement";

import styles from './grid.module.css';

interface Props {
    items: RowData[];
    pinnedLeftColumns: string[];
    pinnedRightColumns: string[];
    normalColumns: string[];
    horizontalScrollLeft: number;
}

class Body extends GridElement<Props> {

    render() {
        return (
            <div style={{display: 'flex'}}>
                <div className={styles.pinnedLeftCells}>
                    {
                        this.props.items.map(row => {
                            return <Row key={row.id} grid={this.grid} data={row} columns={this.props.pinnedLeftColumns} />
                        })
                    }
                </div>
                <div className={styles.normalCells}>
                    <div style={{transform: `translateX(-${this.props.horizontalScrollLeft}px)`}}>
                        {
                            this.props.items.map(row => {
                                return <Row key={row.id} grid={this.grid} data={row} columns={this.props.normalColumns} />
                            })
                        }
                    </div>
                </div>
                <div className={styles.pinnedRightCells}>
                    {
                        this.props.items.map(row => {
                            return <Row key={row.id} grid={this.grid} data={row} columns={this.props.pinnedRightColumns} />
                        })
                    }
                </div>
            </div>
        );
    }

}

export default Body;
