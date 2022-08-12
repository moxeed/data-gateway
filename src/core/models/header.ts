import {DataType} from "../enums/data-type";

export interface Column {
    dataType: DataType
    fieldName: string
    displayName: string
    dataTypeName: string
    filter: any
}