export enum LogLevel {
    Debug,
    Log,
    Info,
    Warning,
    Error,
    Critical
}

export default function print(msg:string, logLevel:LogLevel=LogLevel.Debug, timeDate:boolean=true) {
    let timeDateIndicator:string = timeDate ? "[" + new Date().toLocaleString().replace(", ", " at ") + "]" : "";
    switch (logLevel) {
        case LogLevel.Debug: console.info(timeDateIndicator + " : DEBUG ==> " + msg); break;
        case LogLevel.Log: console.log(timeDateIndicator + " : LOG ==> " + msg); break;
        case LogLevel.Info: console.info(timeDateIndicator + " : INFO ==> " + msg); break;
        case LogLevel.Warning: console.warn(timeDateIndicator + " : WARNING ==> " + msg); break;
        case LogLevel.Error: console.error(timeDateIndicator + " : ERROR ==> " + msg); break;
        case LogLevel.Critical: console.error(timeDateIndicator + " : CRITICAL ERROR ==> " + msg); break;
    }
}