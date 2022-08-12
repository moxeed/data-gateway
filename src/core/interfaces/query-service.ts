import {Column} from "../models/header";
import {FilterOnlyModel, PaginatedFilterModel} from "../dataloader";
import {FetchResult} from "../../sqlserver/enigne/query-builder";

export interface QueryService {
    getViewInfo(database: string, view:string):Promise<Map<string, Column>>
    fetchRows(database: string, view:string, filerModel: PaginatedFilterModel):Promise<FetchResult>
    fetchAllRows(database: string, view:string, filerModel: FilterOnlyModel):Promise<Array<any>>
}