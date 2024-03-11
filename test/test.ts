const setProperty = (obj:any, path:string, value:any):any => {
    const [head, ...rest] = path.split('.')

    return {
        ...obj,
        [head]: rest.length
            ? setProperty(obj[head], rest.join('.'), value)
            : value
    }
}

interface Ix {
    key : string
    ooba : Array<{ name : string, value : number}>
    oop : { rope : number, ooba : string}
}

let x:Ix = {
    key : "rr",
    ooba : [
        { name : "foo", value : 4},
        { name : "bar", value : 2},
        { name : "baz", value : 1}
    ],
    oop : { rope : 5, ooba : "eef" }
}

console.log(x)

let y:Ix = setProperty(x, "ooba.0.r", "ee") as Ix

console.log(y)
console.log(x)