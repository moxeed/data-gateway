import {DataType} from "../enums/data-type";
import {
    DateFilterData,
    NumberFilterData,
    ShamsiDateFilterData,
    TextFilterData,
    TimeFilterData
} from "../models/filter-data";

export const createSample = (dataType: DataType) : any => {
    switch (dataType) {
        case DataType.Number:
            return new NumberFilterData()
        case DataType.Decimal:
            return new NumberFilterData()
        case DataType.Date:
            return new DateFilterData()
        case DataType.Time:
            return new TimeFilterData()
        case DataType.DateTime:
            return new DateFilterData()
        case DataType.Text:
            return new TextFilterData()
        case DataType.Raw:
            return new TextFilterData()
        case DataType.ShamsiTime:
            return new TimeFilterData()
        case DataType.ShamsiDate:
            return new ShamsiDateFilterData()
    }
}