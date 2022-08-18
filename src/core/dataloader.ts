import {DataType} from "./enums/data-type";
import {Column} from "./models/header";
import {Filter} from "./interfaces/filter";
import {NumberFilter} from "../sqlserver/filters/number-filter";
import {TextFilter} from "../sqlserver/filters/text-filter";
import {DateFilter} from "../sqlserver/filters/date-filter";
import {QueryService} from "./interfaces/query-service";
import moment from "jalali-moment";
import {createSample} from "./factory/filter-sample-factory";
import {
    DateFilterData,
    isShamsi, isShamsiTimeFilter,
    removeShamsiPostfixHeader,
    ShamsiDateFilterData,
    shamsiDateHeader,
    shamsiTimeHeader
} from "./models/filter-data";
import {fromShamsiDate, toShamsiDate} from "./utility";
import {DatetimeTimeFilter} from "../sqlserver/filters/datetime-time-filter";
import {TimeFilter} from "../sqlserver/filters/time-filter";

export interface ParametersInput {
    page?: number
    length?: number
    orderBy?: string
    ascending?: boolean
    filters?: {
        [key: string]: any
    }
}

export class PaginatedFilterModel {
    page: number = 1
    length: number = 10
    orderBy: string = "Id"
    ascending: boolean = false
    filters: Array<Filter> = new Array<Filter>()

    constructor(input?: ParametersInput) {
        if (!input)
            return

        if (input.page)
            this.page = input.page
        if (input.length)
            this.length = input.length
        if (input.orderBy)
            this.orderBy = input.orderBy
        if (input.ascending !== undefined)
            this.ascending = input.ascending
    }

    get where(): string | undefined {
        let conditions = new Array<string>()
        for (const filter of this.filters) {
            conditions = [...conditions, ...filter.buildQuery()]
        }

        if (conditions.length > 0) {
            return conditions.join(" AND ")
        }
    }
}

const creatShamsiDateFilterData = (filterDate: ShamsiDateFilterData): DateFilterData => ({
    lessThan: fromShamsiDate(filterDate.lessThan),
    greaterThan: fromShamsiDate(filterDate.greaterThan)
})

const createFilter = (column: Column, filterData: any, key: string): Filter => {
    const {dataType} = column
    const shamsi = isShamsi(key)
    const shamsiTimeFilter = isShamsiTimeFilter(key)

    switch (dataType) {
        case DataType.Number:
            return new NumberFilter(column, filterData)
        case DataType.Decimal:
            return new NumberFilter(column, filterData)
        case DataType.Time:
            return new TimeFilter(column, filterData)
        case DataType.Date:
            return new DateFilter(column, shamsi ? creatShamsiDateFilterData(filterData) : filterData)
        case DataType.DateTime:
            if (shamsiTimeFilter) {
                return new DatetimeTimeFilter(column, filterData)
            }
            console.log(fromShamsiDate(filterData.lessThan))
            return new DateFilter(column, shamsi ? creatShamsiDateFilterData(filterData) : filterData)
        case DataType.Text:
            return new TextFilter(column, filterData)
        case DataType.Raw:
            return new TextFilter(column, filterData)
    }
    return new TextFilter(column, filterData);
}

export class FilterOnlyModel {
    filters: Array<Filter> = new Array<Filter>()

    constructor(filters: Array<Filter>) {
        this.filters = filters
    }

    get where(): string | undefined {
        let conditions = new Array<string>()
        for (const filter of this.filters) {
            conditions = [...conditions, ...filter.buildQuery()]
        }

        if (conditions.length > 0) {
            return conditions.join(" AND ")
        }
    }
}

const parseFilters = (sourceSpecification: Map<string, Column>, filters?: { [key: string]: {} }): { filters: Array<Filter>, ignored: Array<any> } => {
    const ignored = new Array<any>()
    const result = new Array<Filter>()

    if (!filters)
        return {filters: result, ignored}

    for (const key of Object.keys(filters)) {
        const filterData = filters[key]

        const column = isShamsi(key) ? sourceSpecification.get(removeShamsiPostfixHeader(key)) : sourceSpecification.get(key)

        if (!column) {
            ignored.push({[key]: {...filterData, reason: "column not found"}})
            continue;
        }

        const filter = createFilter(column, filterData, key)

        if (!filter.isDataOk()) {
            ignored.push({[key]: {...filterData, reason: "invalid filter"}})
            continue;
        }

        result.push(filter)
    }

    return {filters: result, ignored}
}

const parseParameters = (request: object, sourceSpecification: Map<string, Column>): { filterModel: PaginatedFilterModel, ignored: Array<any> } => {
    const parameters = request as ParametersInput
    const filterModel = new PaginatedFilterModel(parameters)
    const {filters, ignored} = parseFilters(sourceSpecification, parameters?.filters)
    filterModel.filters = filters
    return {filterModel, ignored}
}

const formatData = (specifications: Map<string, Column>, rows: Array<any>) => {
    const formattedHeaders = new Array<Column>();
    const formattedRows = new Array<any>()

    for (const header of specifications.values()) {
        if (header.dataType === DataType.ShamsiDate) {
            formattedHeaders.push({
                ...header,
                dataType: DataType.ShamsiDate,
                dataTypeName: DataType[DataType.ShamsiDate],
                fieldName: shamsiDateHeader(header.fieldName),
                filter: createSample(DataType.ShamsiDate)
            })
        }

        if (header.dataType === DataType.DateTime) {
            formattedHeaders.push({
                displayName: `${header.displayName ?? ""} تاریخ`,
                dataType: DataType.ShamsiDate,
                dataTypeName: DataType[DataType.ShamsiDate],
                fieldName: shamsiDateHeader(header.fieldName),
                filter: createSample(DataType.ShamsiDate)
            })
            formattedHeaders.push({
                dataType: DataType.ShamsiTime,
                dataTypeName: DataType[DataType.ShamsiTime],
                displayName: `${header.displayName ?? ""} ساعت`,
                fieldName: shamsiTimeHeader(header.fieldName),
                filter: createSample(DataType.ShamsiTime)
            })
        }

        formattedHeaders.push(header)
    }

    for (const row of rows) {
        const formattedRow: any = {}
        for (const header of specifications.values()) {

            if (header.dataType === DataType.Date) {
                formattedRow[shamsiDateHeader(header.fieldName)] = toShamsiDate(row[header.fieldName])
            }

            if (header.dataType === DataType.DateTime) {
                formattedRow[shamsiDateHeader(header.fieldName)] = toShamsiDate(row[header.fieldName])
                formattedRow[shamsiTimeHeader(header.fieldName)] = moment(row[header.fieldName]).utc().format("HH:mm")
            }
            formattedRow[header.fieldName] = row[header.fieldName]
        }

        formattedRows.push(formattedRow)
    }

    return {formattedHeaders, formattedRows}
}

export const loadData = async (queryService: QueryService, database: string, view: string, request: object) => {
    const specifications = await queryService.getViewInfo(database, view)

    const {filterModel, ignored} = parseParameters(request ?? {}, specifications)
    const fetchResult = await queryService.fetchRows(database, view, filterModel)
    const {formattedRows, formattedHeaders} = formatData(specifications, fetchResult.rows)

    return {header: formattedHeaders, totalCount: fetchResult.totalCount, rows: formattedRows, ignored}
}

export const loadAll = async (queryService: QueryService, database: string, view: string, request: object) => {
    const specifications = await queryService.getViewInfo(database, view)
    const parameters = request as ParametersInput

    const {filters, ignored} = parseFilters(specifications, parameters?.filters)
    const filterModel = new FilterOnlyModel(filters)
    const rows = await queryService.fetchAllRows(database, view, filterModel)
    const {formattedRows, formattedHeaders} = formatData(specifications, rows)

    return {header: formattedHeaders, rows: formattedRows, ignored}
}