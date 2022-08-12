import {DataType} from "./enums/data-type";
import {Column} from "./models/header";
import {Filter} from "./interfaces/filter";
import {NumberFilter} from "../sqlserver/filters/number-filter";
import {TextFilter} from "../sqlserver/filters/text-filter";
import {DateFilter} from "../sqlserver/filters/date-filter";
import {QueryService} from "./interfaces/query-service";

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
    orderBy: string = "1"
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

const createFilter = (column: Column, filterData: any): Filter => {
    const {dataType} = column

    switch (dataType) {
        case DataType.Number:
            return new NumberFilter(column, filterData)
        case DataType.Decimal:
            return new NumberFilter(column, filterData)
        case DataType.Date:
            return new DateFilter(column, filterData)
        case DataType.Time:
            return new DateFilter(column, filterData)
        case DataType.DateTime:
            return new DateFilter(column, filterData)
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

const parseFilters = (sourceSpecification: Map<string, Column>, filters?: {[key:string]: {}}): { filters: Array<Filter>, ignored: Array<any> } => {
    const ignored = new Array<any>()
    const result = new Array<Filter>()

    if (!filters)
        return {filters: result, ignored}

    for (const key of Object.keys(filters)) {
        const filterData = filters[key]
        const column = sourceSpecification.get(key)

        if (!column) {
            ignored.push({[key]: {...filterData, reason: "column not found"}})
            continue;
        }

        const filter = createFilter(column, filterData)

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

export const loadData = async (queryService: QueryService, database: string, view: string, request: object) => {
    const specifications = await queryService.getViewInfo(database, view)

    const {filterModel, ignored} = parseParameters(request ?? {}, specifications)
    const rows = await queryService.fetchRows(database, view, filterModel)

    return {header: Array.from(specifications.values()), ...rows, ignored}
}

export const loadAll = async (queryService: QueryService, database: string, view: string, request: object) => {
    const specifications = await queryService.getViewInfo(database, view)
    const parameters = request as ParametersInput

    const {filters, ignored} = parseFilters(specifications, parameters?.filters)
    const filterModel = new FilterOnlyModel(filters)
    const rows = await queryService.fetchAllRows(database, view, filterModel)

    return {header: Array.from(specifications.values()), rows, ignored}
}