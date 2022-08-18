import {Column} from "../../core/models/header";
import {TimeFilterData} from "../../core/models/filter-data";
import {TimeFilter} from "./time-filter";

export class DatetimeTimeFilter extends TimeFilter{

    constructor(column:Column, data: TimeFilterData) {
        super(column, data)
    }

    buildQuery(): Array<string> {
        const {greaterThan, lessThan} = this.data
        const items = new Array<string>()

        if (lessThan) {
            items.push(`CONVERT(VARCHAR(8), [${this.column.fieldName}], 108) <= '${this.normalizeTimeValid(lessThan)}'`);
        }

        if (greaterThan) {
            items.push(`CONVERT(VARCHAR(8), [${this.column.fieldName}], 108) >= '${this.normalizeTimeValid(greaterThan)}'`);
        }

        return items;
    }
}