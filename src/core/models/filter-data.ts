export const shamsiDateHeader = (name: string) =>`${name}ShamsiDate`;
export const shamsiTimeHeader = (name: string) =>`${name}ShamsiTime`;
export const removeShamsiPostfixHeader = (name: string) => name.replace("ShamsiDate", "").replace("ShamsiTime", "");
export const isShamsi = (name: string) => name.includes("Shamsi")
export const isShamsiTimeFilter = (name: string) => name.includes("ShamsiTime")

export const jsonFormat = "YYYY-MM-DDTHH:mm:ss"
export const shamsiDateFormat = "YYYY/MM/DD"

export class DateFilterData {
    greaterThan?: string = "2022-10-01T18:30:20"
    lessThan?: string = "2022-10-01T18:30:20"
}

export class ShamsiDateFilterData extends DateFilterData {
    greaterThan?: string = "1400/1/1"
    lessThan?: string = "1401/1/1"
}

export class TimeFilterData {
    greaterThan?: string = "18:30:20"
    lessThan?: string = "18:30:20"
}

export class NumberFilterData {
    greaterThan?: number = 0
    lessThan?: number = 0
    equalTo?: number = 0
    oneOf?: Array<number> = []
}

export class TextFilterData {
    equalTo?: string = ""
    like?: string = ""
}
