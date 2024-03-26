import readline from 'readline';

export default async function askConsole (question:string) : Promise<string> {
    let rl = readline.createInterface({input : process.stdin, output : process.stdout});
    return await new Promise<string>(resolve => {
        rl.question("next ?", answr => {
            rl.close();
            resolve(answr);
        });
    });
}