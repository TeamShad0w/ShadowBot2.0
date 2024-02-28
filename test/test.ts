import path from "path";
import fs from "fs"



let fmsg = ""

fmsg += "Here the list of the commands and a short description :"
            fs.readdirSync("./src/commands").filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async file => {
                let command = require(`../src/commands/${file}`)
                fmsg += `\r\n> **${command.name}** : *${command.description}*`
    
});

console.log(fmsg)