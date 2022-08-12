import {DataType} from "../enums/data-type";
import {DateFilterData, NumberFilterData, TextFilterData} from "../models/filter-data";

export const createSample = (dataType: DataType) : any => {
    switch (dataType) {
        case DataType.Number:
            return new NumberFilterData()
        case DataType.Decimal:
            return new NumberFilterData()
        case DataType.Date:
            return new DateFilterData()
        case DataType.Time:
            return new DateFilterData()
        case DataType.DateTime:
            return new DateFilterData()
        case DataType.Text:
            return new TextFilterData()
        case DataType.Raw:
            return new TextFilterData()
    }
}