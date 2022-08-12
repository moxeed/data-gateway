export interface Filter{
    buildQuery(): Array<string>
    isDataOk(): boolean
}