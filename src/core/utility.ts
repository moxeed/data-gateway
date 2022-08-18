import moment from "jalali-moment";
import {jsonFormat, shamsiDateFormat} from "./models/filter-data";

export const fromShamsiDate = (date?: string) => date && moment.from(date, "fa", shamsiDateFormat).locale("en").format(jsonFormat)
export const toShamsiDate = (date?: string) => date && moment.from(date, "en", jsonFormat).locale("fa").format(shamsiDateFormat)