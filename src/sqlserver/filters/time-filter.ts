import {Filter} from "../../core/interfaces/filter";
import {Column} from "../../core/models/header";
import {TimeFilterData} from "../../core/models/filter-data";

export class TimeFilter implements Filter {

    constructor(protected column: Column, protected data: TimeFilterData) {
    }

    isTimeValid(time: string): boolean {
        return /([0-1]?\d|2[0-3]):[0-5]?\d(:[0-5]?\d)?$/.test(time)
    }

    normalizeTimeValid(time: string): string {
        const parts = time.split(":").map(p => `00${p}`.slice(-2))
        while (parts.length < 3)
            parts.push("00")
        return parts.join(":")
    }

    buildQuery(): Array<string> {
        const {greaterThan, lessThan} = this.data
        const items = new Array<string>()

        if (lessThan) {
            items.push(`[${this.column.fieldName}] <= '${this.normalizeTimeValid(lessThan)}'`);
        }

        if (greaterThan) {
            items.push(`[${this.column.fieldName}] >= '${this.normalizeTimeValid(greaterThan)}'`);
        }

        return items;
    }

    isDataOk(): boolean {
        return (this.data.greaterThan !== undefined && this.isTimeValid(this.data.greaterThan))
            || (this.data.lessThan !== undefined && this.isTimeValid(this.data.lessThan))
    }
}