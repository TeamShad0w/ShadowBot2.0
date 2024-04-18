"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedProperty = exports.setNestedProperty = void 0;
async function setNestedProperty(obj, path, value) {
    const [head, ...rest] = path.split('.');
    return {
        ...obj,
        [head]: rest.length ? await setNestedProperty(obj[head], rest.join('.'), value) : value
    };
}
exports.setNestedProperty = setNestedProperty;
async function getNestedProperty(obj, path) {
    const [head, ...rest] = path.split('.');
    return rest.length ? await getNestedProperty(obj[head], rest.join('.')) : obj[head];
}
exports.getNestedProperty = getNestedProperty;
