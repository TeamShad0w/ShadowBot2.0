import ClientWithCommands from "./clientWithCommands";

/**
 * A function that takes the bot as an argument, and returns the state of the execution (1 if okay, the error message otherwise)
 * @param {ClientWithCommands} bot The bot's clieny
 * @returns {Promise<number|string>} 1 if execution went okay, the error message otherwise
 */
type ITryFunctionCallback = (bot:ClientWithCommands) => Promise<number|string>;

// TODO : handle differenciation between warning, error and critical error. Print the first two and print and stop the program for the last one.
/**
 * Tries to execute a function, if an error is thrown, throw it with the associated message
 * @param {ClientWithCommands} bot The bot's client
 * @param {ITryFunctionCallback} callback The function to try
 * @returns {Promise<void>}
 */
export async function tryFunction(bot:ClientWithCommands, callback:ITryFunctionCallback):Promise<void> {
      let tryF:number|string = await callback(bot);
      if( tryF !== 1){
          throw new Error(tryF.toString());
      }
  }