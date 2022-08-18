import express, {Application, Request, Response} from 'express'
import {MssqlQueryService} from "./sqlserver/enigne/query-builder";
import {loadAll, loadData} from "./core/dataloader";
import Excel from 'exceljs'

console.log()

const app: Application = express()

app.use(express.json())

app.post("/:database/:view", async (request: Request, response: Response) => {
    const {database, view} = request.params
    const filters = request.body

    const dataTable = await loadData(new MssqlQueryService(), database, view, filters)
    response.status(200).json(dataTable)
})

app.post("/excel/:database/:view", async (request: Request, response: Response) => {
    const {database, view} = request.params
    const filters = request.body

    const {header, rows} = await loadAll(new MssqlQueryService(), database, view, filters)
    const workbook = new Excel.Workbook()
    const sheet = workbook.addWorksheet(view)
    sheet.columns = header.map(h => ({
        key: h.fieldName, header: h.displayName, width: 50, style: {
        }
    }))
    sheet.addRows(rows)

    const buffer = await workbook.xlsx.writeBuffer()
    response.contentType('application/vnd.openxmlformats');
    response.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    response.end(buffer)
})

const PORT = 8000
app.listen(PORT, () => {
    console.log(`Server Running here 👉 https://localhost:${PORT}`);
})

