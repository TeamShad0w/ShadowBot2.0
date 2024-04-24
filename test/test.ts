type custom = string;

async function run(arg1:custom | number) : Promise<void> {
    console.log(typeof arg1)
}

run(1);
let x:custom = "-1";
run(x);