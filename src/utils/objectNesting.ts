/**
 * This function allows you to access a nested property in an object from a string path.
 * It will then return the object with the modified property.
 * 
 * Took from : https://webtips.dev/webtips/javascript/update-nested-property-by-string
 * 
 * @param obj The nest object to modify
 * @param path The path to the property to modify
 * @param value The new value the property should get
 * @returns The object inputed but with the modified property
 */
export async function setNestedProperty<T>(obj:T, path:string, value:any):Promise<T>
export async function setNestedProperty(obj:any, path:string, value:any):Promise<any> {
    const [head, ...rest] = path.split('.');

    return {
        ...obj,
        [head]: rest.length ? await setNestedProperty(obj[head], rest.join('.'), value) : value
    };
}

// TODO : jsDoc
export async function getNestedProperty(obj:any, path:string):Promise<any> {
    const [head, ...rest] = path.split('.');
    return rest.length ? await getNestedProperty(obj[head], rest.join('.')) : obj[head];
}