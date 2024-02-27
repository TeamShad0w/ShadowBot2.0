"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Log"] = 1] = "Log";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Warning"] = 3] = "Warning";
    LogLevel[LogLevel["Error"] = 4] = "Error";
    LogLevel[LogLevel["Critical"] = 5] = "Critical";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
function print(msg, logLevel = LogLevel.Debug, timeDate = true) {
    let timeDateIndicator = timeDate ? "[" + new Date().toLocaleString().replace(", ", " at ") + "]" : "";
    switch (logLevel) {
        case LogLevel.Debug:
            console.info(timeDateIndicator + " : DEBUG ==> ", msg);
            break;
        case LogLevel.Log:
            console.log(timeDateIndicator + " : LOG ==> ", msg);
            break;
        case LogLevel.Info:
            console.info(timeDateIndicator + " : INFO ==> ", msg);
            break;
        case LogLevel.Warning:
            console.warn(timeDateIndicator + " : WARNING ==> ", msg);
            break;
        case LogLevel.Error:
            console.error(timeDateIndicator + " : ERROR ==> ", msg);
            break;
        case LogLevel.Critical:
            console.error(timeDateIndicator + " : CRITICAL ERROR ==> ", msg);
            break;
    }
}
exports.default = print;
