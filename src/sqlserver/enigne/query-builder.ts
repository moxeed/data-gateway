import {FilterOnlyModel, PaginatedFilterModel} from "../../core/dataloader";
import {QueryTypes, Sequelize} from "sequelize";
import {DataType} from "../../core/enums/data-type";
import {createSample} from "../../core/factory/filter-sample-factory";
import {Column} from "../../core/models/header";
import {QueryService} from "../../core/interfaces/query-service";

export interface FetchResult {
    rows: Array<any>
    totalCount: number
}

const mssqlDataTypes: { [key: string]: DataType } = {
    ['int']: DataType.Number,
    ['smallint']: DataType.Number,
    ['tinyint']: DataType.Number,
    ['numeric']: DataType.Number,
    ['bigint']: DataType.Number,
    ['bit']: DataType.Boolean,
    ['binary']: DataType.Raw,
    ['char']: DataType.Text,
    ['text']: DataType.Text,
    ['varchar']: DataType.Text,
    ['nchar']: DataType.Text,
    ['ntext']: DataType.Text,
    ['nvarchar']: DataType.Text,
    ['date']: DataType.Date,
    ['datetime']: DataType.DateTime,
    ['datetime2']: DataType.DateTime,
    ['smalldatetime']: DataType.DateTime,
    ['datetimeoffset']: DataType.DateTime,
    ['time']: DataType.Time,
    ['timestamp']: DataType.Time,
    ['decimal']: DataType.Decimal,
    ['float']: DataType.Decimal,
    ['real']: DataType.Decimal,
    ['varbinary']: DataType.Raw,
    ['xml']: DataType.Raw
}

const openDb = (database: string) => {
    return new Sequelize(database, 'datarw', '1qaz@WSX', {
        dialect: "mssql",
        dialectOptions: {
            server: "localhost"
        },
    })
}

export class MssqlQueryService implements QueryService {
    fetchAllRows(database: string, view: string, filerModel: FilterOnlyModel): Promise<Array<any>> {
        return fetchAllRows(database, view, filerModel)
    }

    fetchRows(database: string, view: string, filerModel: PaginatedFilterModel): Promise<FetchResult> {
        return fetchRows(database, view, filerModel)
    }

    getViewInfo(database: string, view: string): Promise<Map<string, Column>> {
        return getViewInfo(database, view)
    }
}

export const getViewInfo = async (database: string, view: string): Promise<Map<string, Column>> => {

    const db = openDb(database)
    const specification = new Map<string, Column>()

    const result = await db.query<{ columnName: string, dataType: string, displayName: string }>(`SELECT
	c.name AS columnName,
	t.name AS dataType,
    sep.value AS displayName 
    FROM sys.views v
		INNER JOIN sys.schemas s on v.schema_id = s.schema_id
		INNER JOIN sys.columns c on v.object_id = c.object_id
		INNER JOIN sys.types t on t.system_type_id = c.system_type_id
		LEFT JOIN sys.extended_properties sep on v.object_id = sep.major_id
                                         AND c.column_id = sep.minor_id
                                         AND sep.name = 'DisplayName'
    where v.name = '${view}' AND s.name = 'expose'`, {
        type: QueryTypes.SELECT
    })


    result.forEach((r) => {
        const dataType = mssqlDataTypes[r.dataType]
        specification.set(r.columnName, {
            dataType: dataType,
            dataTypeName: DataType[dataType],
            fieldName: r.columnName,
            displayName: r.displayName,
            filter: createSample(dataType)
        })
    })

    await db.close()
    return specification
}

export const fetchRows = async (database: string, view: string, filterModel: PaginatedFilterModel): Promise<FetchResult> => {
    const {page, length, orderBy, ascending, where} = filterModel
    const skip = (page - 1) * length
    const whereClause = where ? `WHERE ${where}` : ""

    const db = openDb(database)
    const rows = await db.query(`

    SELECT * 
    FROM expose.[${view}]
    ${whereClause}
    ORDER BY [${orderBy}] ${ascending ? "asc" : "desc"}
    OFFSET ${skip} ROWS FETCH NEXT ${length} ROWS ONLY`, {
        type: QueryTypes.SELECT
    });

    const totalCount = await db.query<{ count: number }>(`
    SELECT COUNT(*) AS count
    FROM expose.${view}
    ${whereClause}`, {
        type: QueryTypes.SELECT
    });

    await db.close()
    return {rows, totalCount: totalCount[0].count}
}

export const fetchAllRows = async (database: string, view: string, filterModel: FilterOnlyModel): Promise<Array<any>> => {
    const {where} = filterModel
    const whereClause = where ? `WHERE ${where}` : ""

    const db = openDb(database)
    const rows = await db.query(`

    SELECT * 
    FROM expose.${view}
    ${whereClause}`, {
        type: QueryTypes.SELECT
    });

    await db.close()
    return rows
}