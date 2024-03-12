export function getNestedProperty(obj:any, path:any):any {
    const [head, ...rest] = path.split('.');
    if(!rest.length) {
        return obj[head];
    }
    return getNestedProperty(obj[head], rest.join('.'));
}

let x = {
    name : "e",
    oof : {
        ll : 1,
        key : [ 1, 5, 8],
        tracker : [
            { name : "g", value : 5},
            { name : "r", value : 6},
            { name : "t", value : 9}
        ]
    }
}

console.log(x)
let y = getNestedProperty(x, 'oof.tracker.1')
console.log(y);
console.log(x)