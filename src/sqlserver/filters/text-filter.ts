import {Filter} from "../../core/interfaces/filter";
import {Column} from "../../core/models/header";
import {TextFilterData} from "../../core/models/filter-data";

export class TextFilter implements Filter {
    constructor(private column: Column, private data: TextFilterData) {
    }

    isDataOk(): boolean {
        return this.data.equalTo !== undefined ||
            this.data.like !== undefined
    }

    buildQuery(): Array<string> {
        const {equalTo, like} = this.data

        if (equalTo) {
            return [`${this.column.fieldName} = '${equalTo}'`];
        }

        if (like) {
            return [`${this.column.fieldName} LIKE '%${like}%'`];
        }

        return []
    }
}