export class DateFilterData {
    greaterThan?: string = "2022-10-01T18:30:20"
    lessThan?: string = "2022-10-01T18:30:20"
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
