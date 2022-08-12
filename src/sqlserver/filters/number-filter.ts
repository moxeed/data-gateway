import {Filter} from "../../core/interfaces/filter";
import {Column} from "../../core/models/header";
import {NumberFilterData} from "../../core/models/filter-data";

export class NumberFilter implements Filter {
    constructor(private column: Column, private data: NumberFilterData) {
    }

    isDataOk(): boolean {
        return this.data.greaterThan !== undefined
            || this.data.lessThan !== undefined
            || this.data.equalTo !== undefined
            || (this.data.oneOf !== undefined && Array.isArray(this.data.oneOf))
    }

    buildQuery(): Array<string> {
        const {lessThan, equalTo, greaterThan, oneOf} = this.data

        const items = new Array<string>()

        if (lessThan) {
            items.push(`${this.column.fieldName} < ${lessThan}`);
        }

        if (greaterThan) {
            items.push(`${this.column.fieldName} > ${greaterThan}`);
        }

        if (equalTo) {
            items.push(`${this.column.fieldName} = ${equalTo}`);
        }

        if (oneOf) {
            items.push(`${this.column.fieldName} IN (${oneOf.join(',')})`);
        }

        return items
    }
}