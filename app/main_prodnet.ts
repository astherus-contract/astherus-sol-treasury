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
    withdrawSOLBySignature,
    withdrawSOLToCounterParty,
    withdrawTokenBySignature,
    withdrawTokenToCounterParty,
} from './cloud-sol-treasury';
import {PublicKey} from "@solana/web3.js";
import base58 from "bs58";
import * as anchor from "@coral-xyz/anchor";

const process = require("process");
process.env.ANCHOR_WALLET = '/Users/user/.config/solana/id.json'
process.env.ANCHOR_PROVIDER_URL = 'https://api.mainnet-beta.solana.com'


// process.env.ANCHOR_PROVIDER_URL = 'http://127.0.0.1:8899'
// process.env.ANCHOR = 'local'
process.env.ANCHOR = 'prod'
process.env.ONLY_BUILD_INSTRUCTION = false

async function main() {
    console.log('process.argv', process.argv);

    console.log("Let's start...");
    await loadProvider();
    console.log('loadProvider Success');
    await loadCommonKeypair();
    console.log('loadCommonKeypair Success');
    // await requestAirdropAll()
    // console.log('requestAirdropAll Success');
    switch (process.argv[2]) {
        case 'initialize': {
            await initialize()
            console.log('initialize Success');
            break
        }
        case 'addSol': {
            await loadSolKeypair();
            console.log('loadSolKeypair Success');

            await addSol()
            console.log('addSol Success');
            break
        }
        case 'addToken': {
            let tokenName = process.argv[3];
            if (tokenName == '' || tokenName == undefined) {
                console.log('tokenName is empty');
                break
            }
            process.env.tokenName = tokenName.trim();
            await loadTokenKeypair();
            console.log('loadTokenKeypair Success');

            await prepareToken()
            console.log('prepareToken Success');

            await addToken()
            console.log('addToken Success');
            break
        }
        case 'changeTruthHolder': {
            let publicKey = process.argv[3];
            if (publicKey == '' || publicKey == undefined) {
                console.log('publicKey is empty');
                break
            }
            await changeTruthHolder(new PublicKey(publicKey.trim()));
            console.log('changeTruthHolder Success');
            break
        }
        case 'changeAuthority': {
            let publicKey = process.argv[3];
            if (publicKey == '' || publicKey == undefined) {
                console.log('publicKey is empty');
                break
            }
            await changeAuthority(new PublicKey(publicKey.trim()));
            console.log('changeAuthority Success');
            break
        }
        case 'changeCounterParty': {
            let publicKey = process.argv[3];
            if (publicKey == '' || publicKey == undefined) {
                console.log('publicKey is empty');
                break
            }
            await changeCounterParty(new PublicKey(publicKey.trim()));
            console.log('changeCounterParty Success');
            break
        }
        case 'changeOperator': {
            let publicKey = process.argv[3];
            if (publicKey == '' || publicKey == undefined) {
                console.log('publicKey is empty');
                break
            }
            await changeOperator(new PublicKey(publicKey.trim()));
            console.log('changeOperator Success');
            break
        }
        case 'changePriceFeedProgram': {
            let publicKey = process.argv[3];
            if (publicKey == '' || publicKey == undefined) {
                console.log('publicKey is empty');
                break
            }
            await changePriceFeedProgram(new PublicKey(publicKey.trim()));
            console.log('changePriceFeedProgram Success');
            break
        }
        case 'updateGlobalWithdrawEnabled': {
            let enabled = process.argv[3];
            if (enabled == '' || enabled == undefined) {
                console.log('enabled is empty');
                break
            }
            await updateGlobalWithdrawEnabled(enabled == 'true');
            console.log('updateGlobalWithdrawEnabled Success');
            break
        }
        case 'updateHourlyLimit': {
            let limit = process.argv[3];
            if (limit == '' || limit == undefined) {
                console.log('limit is empty');
                break
            }
            await updateHourlyLimit(new anchor.BN(limit));
            console.log('updateHourlyLimit Success');
            break
        }
        case 'updateSolEnable': {
            let enabled = process.argv[3];
            if (enabled == '' || enabled == undefined) {
                console.log('enabled is empty');
                break
            }
            await loadSolKeypair();
            console.log('loadSolKeypair Success');
            await updateSolEnable(enabled == 'true');
            console.log('updateSolEnable Success');
            break
        }
        case 'updateTokenEnable': {
            let tokenName = process.argv[3];
            if (tokenName == '' || tokenName == undefined) {
                console.log('tokenName is empty');
                break
            }
            process.env.tokenName = tokenName.trim();

            let enabled = process.argv[4];
            if (enabled == '' || enabled == undefined) {
                console.log('enabled is empty');
                break
            }

            await loadTokenKeypair();
            console.log('loadTokenKeypair Success');

            await prepareToken()
            console.log('prepareToken Success');
            await updateTokenEnable(enabled == 'true');
            console.log('updateTokenEnable Success');
            break
        }
        case 'getTokenClaimHistory': {
            let tokenName = process.argv[3];
            if (tokenName == '' || tokenName == undefined) {
                console.log('tokenName is empty');
                break
            }
            process.env.tokenName = tokenName.trim();
            await loadTokenKeypair();
            console.log('loadTokenKeypair Success');

            await prepareToken()
            console.log('prepareToken Success');
            await getTokenClaimHistory();
            console.log('getTokenClaimHistory Success');
            break
        }
    }
    console.log('all Success');
}

main().then(
    () => process.exit(),
    async err => {
        // let pub = new PublicKey(base58.encode(Uint8Array.from(Buffer.from('ee0b78103520825749376d462b15359316ef69472dda9a19e58b05de4eee8653', 'hex'))))
        // await changeTruthHolder(pub);
        // console.log('changeTruthHolder Success');
        console.error(err);
        process.exit(-1);
    },
);
