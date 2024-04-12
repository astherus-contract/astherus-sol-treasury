import {
    establishConnection,
    checkProgram, initAccount,
} from './sol_treasury';

async function main() {
    console.log("Let's start...");

    await establishConnection();

    await checkProgram();

    await initAccount();

    console.log('Success');
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);
