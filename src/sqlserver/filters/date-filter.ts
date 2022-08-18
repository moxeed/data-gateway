import {Filter} from "../../core/interfaces/filter";
import {Column} from "../../core/models/header";
import {DateFilterData, jsonFormat} from "../../core/models/filter-data";
import moment from "jalali-moment";

const sqlFormat = "YYYY-MM-DD HH:mm:ss"

export class DateFilter implements Filter {
    constructor(private column: Column, private data: DateFilterData) {
    }

    toSqlDateTime(date: string): string {
        return moment(date, jsonFormat).format(sqlFormat)
    }

    isValidDateTime(date: string): boolean {
        return moment(date, jsonFormat).isValid()
    }

    isDataOk(): boolean {
        return (this.data.greaterThan !== undefined && this.isValidDateTime(this.data.greaterThan)) ||
            (this.data.lessThan !== undefined && this.isValidDateTime(this.data.lessThan))
    }

    buildQuery(): Array<string> {
        const {greaterThan, lessThan} = this.data
        const items = new Array<string>()

        if (lessThan) {
            items.push(`[${this.column.fieldName}] <= '${this.toSqlDateTime(lessThan)}'`);
        }

        if (greaterThan) {
            items.push(`[${this.column.fieldName}] >= '${this.toSqlDateTime(greaterThan)}'`);
        }

        return items;
    }
}