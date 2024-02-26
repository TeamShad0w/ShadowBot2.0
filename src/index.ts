import Discord from 'discord.js';
import internal from 'stream';
import Config from './config.json';

const bot = new Discord.Client({
    intents: [3276799]
});

async function login():Promise<number|string> {
    try {
        await bot.login(Config.token);
    }catch(err:unknown) {
        return "bot couldn't login : " + err;
    }
    return 1;
}

async function main():Promise<void> {
    console.log("starting bot");

    let tryLogin:number|string = await login();
    if( tryLogin !== 1){
        throw new Error(tryLogin.toString());
    }

    console.log("bot logged in");
}

main();

//TODO : ping pong