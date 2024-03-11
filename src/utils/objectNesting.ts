/**
 * This function allows you to access and modify a nested property in an object from a string path.
 * 
 * Took from : https://webtips.dev/webtips/javascript/update-nested-property-by-string
 * 
 * @param obj The nest object to modify
 * @param path The path to the property to modify
 * @param value The new value the property should get
 * @returns The object inputed but with the modified property
 */
export async function setNestedProperty(obj:any, path:string, value:any):Promise<any> {
    const [head, ...rest] = path.split('.')

    return {
        ...obj,
        [head]: rest.length
            ? setNestedProperty(obj[head], rest.join('.'), value)
            : value
    }
}