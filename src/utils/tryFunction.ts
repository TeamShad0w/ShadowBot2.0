import ClientWithCommands from "./clientWithCommands";

//TODO : jsDoc
export interface ITryFunctionCallback {
    (bot:ClientWithCommands) : Promise<number|string>;
}

//TODO : jsDoc
export async function tryFunction(bot:ClientWithCommands, callback:ITryFunctionCallback):Promise<void> {
      let tryF:number|string = await callback(bot);
      if( tryF !== 1){
          throw new Error(tryF.toString());
      }
  }