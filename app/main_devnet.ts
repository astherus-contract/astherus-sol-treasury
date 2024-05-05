import {
    addSol,
    addToken, changeAuthority,
    changeCounterParty,
    changeOperator,
    changePriceFeedProgram,
    changeTruthHolder,
    depositSOL,
    depositToken, getSolClaimHistory, getTokenClaimHistory,
    initialize, loadCommonKeypair, loadProvider, loadSolKeypair, loadTokenKeypair,
    prepareToken, removeSolClaimHistory, removeTokenClaimHistory,
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
import {PublicKey} from "@solana/web3.js";
import base58 from "bs58";

const process = require("process");
process.env.ANCHOR_WALLET = '/Users/user/.config/solana/id.json'
process.env.ANCHOR_PROVIDER_URL = 'https://api.devnet.solana.com'
process.env.ANCHOR = 'dev'
const tokens = ['USDT1', 'USDT', 'USDC'];

async function sol() {
    console.log("Let's start SOL");
    await loadSolKeypair();
    console.log('loadSolKeypair Success');

    await addSol()
    console.log('addSol Success');

    await updateGlobalWithdrawEnabled();
    console.log('updateGlobalWithdrawEnabled Success');

    await updateHourlyLimit();
    console.log('updateHourlyLimit Success');

    await depositSOL();
    console.log('depositSOL Success');
    await withdrawSOL();
    console.log('withdrawSOL Success');

    await updateSolEnable();
    console.log('updateSolEnable Success');

    await withdrawSOLBySignature();
    console.log('withdrawSOLBySignature Success');
    await withdrawSOLToCounterParty();
    console.log('withdrawSOLToCounterParty Success');

    await removeSolClaimHistory('0,1,2,3,4,5,6,7,8,9,10');
    console.log('removeSolClaimHistory Success');

    await getSolClaimHistory();
    console.log('getSolClaimHistory Success');

    console.log("end SOL");

}

async function token() {
    for (let tokenName of tokens) {
        console.log("Let's start ", tokenName);

        process.env.tokenName = tokenName;
        await loadTokenKeypair();
        console.log('loadTokenKeypair Success');

        await prepareToken()
        console.log('prepareToken Success');

        await addToken()
        console.log('addToken Success');

        await updateGlobalWithdrawEnabled();
        console.log('updateGlobalWithdrawEnabled Success');

        await updateHourlyLimit();
        console.log('updateHourlyLimit Success');

        await changeOperator();
        console.log('changeOperator Success');

        await changeCounterParty();
        console.log('changeCounterParty Success');

        await changeAuthority();
        console.log('changeAuthority Success');

        await changePriceFeedProgram();
        console.log('changePriceFeedProgram Success');

        await updateTokenEnable()
        console.log('updateTokenEnable Success');

        await depositToken();
        console.log('depositToken Success');

        await withdrawToken();
        console.log('withdrawToken Success');

        await withdrawTokenBySignature();
        console.log('withdrawTokenBySignature Success');

        await withdrawTokenToCounterParty();
        console.log('withdrawTokenToCounterParty Success');

        await removeTokenClaimHistory('0,1,2,3,4,5,6,7,8,9,10');
        console.log('removeTokenClaimHistory Success');

        await getTokenClaimHistory();
        console.log('getTokenClaimHistory Success');

        console.log("end ", tokenName);

    }
}

async function main() {
    console.log("Let's start...");
    await loadProvider();
    console.log('loadProvider Success');
    await loadCommonKeypair();
    console.log('loadCommonKeypair Success');
    // await requestAirdropAll()
    // console.log('requestAirdropAll Success');

    await initialize()
    console.log('initialize Success');

    await changeTruthHolder();
    console.log('changeTruthHolder Success');

    //SOL
    await sol();

    //token
    await token();

    let pub = new PublicKey(base58.encode(Uint8Array.from(Buffer.from('ee0b78103520825749376d462b15359316ef69472dda9a19e58b05de4eee8653', 'hex'))))
    await changeTruthHolder(pub);
    console.log('changeTruthHolder Success');

    console.log('all Success');
}

main().then(
    () => process.exit(),
    async err => {
        let pub = new PublicKey(base58.encode(Uint8Array.from(Buffer.from('ee0b78103520825749376d462b15359316ef69472dda9a19e58b05de4eee8653', 'hex'))))
        await changeTruthHolder(pub);
        console.log('changeTruthHolder Success');
        console.error(err);
        process.exit(-1);
    },
);
