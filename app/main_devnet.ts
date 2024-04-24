import {
    addSol,
    addToken, changeAuthority,
    changeCounterParty,
    changeOperator,
    changePriceFeedProgram,
    changeTruthHolder,
    depositSOL,
    depositToken,
    initialize, loadKeypair, loadProvider,
    prepareToken,
    requestAirdropAll,
    updateGlobalWithdrawEnabled,
    updateHourlyLimit, updateSolEnable, updateTokenEnable,
    withdrawSOL,
    withdrawSOLBySignature,
    withdrawSOLToCounterParty,
    withdrawToken,
    withdrawTokenBySignature,
    withdrawTokenToCounterParty,
} from './cloud-sol-treasury';

const process = require("process");
process.env.ANCHOR_WALLET = '/Users/user/.config/solana/id.json'
process.env.ANCHOR_PROVIDER_URL = 'https://api.devnet.solana.com'
process.env.ANCHOR = 'dev'

async function main() {
    console.log("Let's start...");
    await loadProvider();
    console.log('loadProvider Success');
    await loadKeypair();
    console.log('loadKeypair Success');
    //await requestAirdropAll()
    console.log('requestAirdropAll Success');
    await prepareToken()
    console.log('prepareToken Success');
    await initialize()
    console.log('initialize Success');
    await addSol()
    console.log('addSol Success');
    await addToken()
    console.log('addToken Success');

    await depositSOL();
    console.log('depositSOL Success');
    await withdrawSOL();
    console.log('withdrawSOL Success');

    await updateGlobalWithdrawEnabled();
    console.log('updateGlobalWithdrawEnabled Success');
    await updateHourlyLimit();
    console.log('updateHourlyLimit Success');
    await changeOperator();
    console.log('changeOperator Success');
    await changeCounterParty();
    console.log('changeCounterParty Success');
    await changeTruthHolder();
    console.log('changeTruthHolder Success');
    await changeAuthority();
    console.log('changeAuthority Success');
    await changePriceFeedProgram();
    console.log('changePriceFeedProgram Success');
    await changePriceFeedProgram();
    console.log('changePriceFeedProgram Success');

    await updateTokenEnable()
    console.log('updateTokenEnable Success');
    await updateSolEnable();
    console.log('updateSolEnable Success');

    await depositToken();
    console.log('depositToken Success');
    await withdrawToken();
    console.log('withdrawToken Success');
    await withdrawTokenBySignature();
    console.log('withdrawTokenBySignature Success');

    await withdrawSOLBySignature();
    console.log('withdrawSOLBySignature Success');
    await withdrawSOLToCounterParty();
    console.log('withdrawSOLToCounterParty Success');
    await withdrawTokenToCounterParty();
    console.log('withdrawTokenToCounterParty Success');

    console.log('all Success');
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);
