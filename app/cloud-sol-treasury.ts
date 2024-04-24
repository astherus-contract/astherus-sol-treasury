import {getOrCreateKeypair, createKeypair, getKeypair, saveKeypair, savePublicKey} from "./utils";
import {Ed25519Program, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {CloudSolTreasury} from "../target/types/cloud_sol_treasury";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createMint, getAssociatedTokenAddressSync,
    getMint,
    getOrCreateAssociatedTokenAccount, mintToChecked,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import assert from "assert";
import * as ed from "@noble/ed25519";
import sleep from 'await-sleep'


const createKeccakHash = require('keccak')

let provider;
let programWallet;
let program;


let bankKeypair;
let walletKeypair;
let operatorKeypair;
let counterPartyKeypair;
let userKeypair;
let priceFeed;
let priceFeedProgram;
let mint;
let usdc_auth;
let admin;
let admin_bump;
let tokenVaultAuthority;
let token_vault_authority_bump;
let solVault;
let sol_vault_bump;
let tokenVault;
let userToken;
let counterPartyToken;

export async function loadProvider() {
    savePublicKey(process.env.ANCHOR, 'associatedTokenProgram', ASSOCIATED_TOKEN_PROGRAM_ID);
    savePublicKey(process.env.ANCHOR, 'tokenProgram', TOKEN_PROGRAM_ID);
    savePublicKey(process.env.ANCHOR, 'systemProgram', anchor.web3.SystemProgram.programId);
    savePublicKey(process.env.ANCHOR, 'ixSysvar', anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY);


    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    programWallet = getKeypair(process.env.ANCHOR, 'programWallet');
    if (programWallet == null) {
        programWallet = (provider.wallet as anchor.Wallet).payer;
        saveKeypair(process.env.ANCHOR, 'programWallet', programWallet);
    }
    program = anchor.workspace.CloudSolTreasury as Program<CloudSolTreasury>;
    console.log(program.programId)
}


export async function loadKeypair() {
    //const bankKeypair = anchor.web3.Keypair.generate();
    bankKeypair = getOrCreateKeypair(process.env.ANCHOR, 'bank');

//const walletKeypair = anchor.web3.Keypair.generate();
    walletKeypair = programWallet;

    counterPartyKeypair = getOrCreateKeypair(process.env.ANCHOR, 'counterParty');
//const counterPartyKeypair = anchor.web3.Keypair.generate();

    operatorKeypair = getOrCreateKeypair(process.env.ANCHOR, 'operator');
//const operatorKeypair = anchor.web3.Keypair.generate();

    userKeypair = getOrCreateKeypair(process.env.ANCHOR, 'user');
//const userKeypair = anchor.web3.Keypair.generate();

    priceFeed = getOrCreateKeypair(process.env.ANCHOR, 'priceFeed').publicKey;
//const priceFeed = anchor.web3.Keypair.generate().publicKey;
    priceFeedProgram = getOrCreateKeypair(process.env.ANCHOR, 'priceFeedProgram').publicKey;
//const priceFeedProgram = anchor.web3.Keypair.generate().publicKey;

    mint = getOrCreateKeypair(process.env.ANCHOR, 'mint');
//const mint = anchor.web3.Keypair.generate();

    usdc_auth = getOrCreateKeypair(process.env.ANCHOR, 'usdc_auth');
//const usdc_auth = anchor.web3.Keypair.generate();

    [admin, admin_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("admin")
        ],
        program.programId);
    savePublicKey(process.env.ANCHOR, 'admin', admin);

    [tokenVaultAuthority, token_vault_authority_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("token_vault_authority"),
            bankKeypair.publicKey.toBuffer()
        ],
        program.programId);
    savePublicKey(process.env.ANCHOR, 'tokenVaultAuthority', tokenVaultAuthority);


    [solVault, sol_vault_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("sol_vault"), admin.toBuffer()
        ],
        program.programId);
    savePublicKey(process.env.ANCHOR, 'solVault', solVault);
}


async function requestAirdrop(publicKey: PublicKey) {
    let res = await provider.connection.requestAirdrop(publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL);

    let latestBlockHash = await provider.connection.getLatestBlockhash()

    await provider.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: res,
    });
}

export async function requestAirdropAll() {
    try {
        await requestAirdrop(walletKeypair.publicKey);
    } catch (e) {
        console.log(e)
    }
    try {
        await requestAirdrop(userKeypair.publicKey);
    } catch (e) {
        console.log(e)
    }
    try {
        await requestAirdrop(operatorKeypair.publicKey);
    } catch (e) {
        console.log(e)
    }

    try {
        await requestAirdrop(counterPartyKeypair.publicKey);
    } catch (e) {
        console.log(e)
    }
}

export async function prepareToken() {
    try {
        await getMint(provider.connection, mint.publicKey, null, TOKEN_PROGRAM_ID);
    } catch (e) {
        // console.log(e)
        if (e.toString().indexOf('TokenAccountNotFoundError') < 0) {
            throw e;
        }
        await createMint(
            provider.connection,
            walletKeypair,
            usdc_auth.publicKey,
            usdc_auth.publicKey,
            0,
            mint,
            null,
            TOKEN_PROGRAM_ID
        );
        let userUsdtTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, mint.publicKey, walletKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
        await mintToChecked(provider.connection, walletKeypair, mint.publicKey, userUsdtTokenAccount.address, usdc_auth, 20000000000000e6, 0, [], undefined, TOKEN_PROGRAM_ID);
    }

    let userUsdtTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, mint.publicKey, walletKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    tokenVault = getAssociatedTokenAddressSync(mint.publicKey, tokenVaultAuthority, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    savePublicKey(process.env.ANCHOR, 'tokenVault', tokenVault);
    counterPartyToken = (await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, mint.publicKey, counterPartyKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)).address;
    userToken = userUsdtTokenAccount.address;
}

export async function initialize() {
    if ((await provider.connection.getAccountInfo(admin)) != null) {
        return
    }
    const tx = await program.methods.initialize(true, new anchor.BN(100e8), walletKeypair.publicKey, walletKeypair.publicKey, walletKeypair.publicKey, priceFeedProgram)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();
}

export async function addSol() {
    if ((await provider.connection.getAccountInfo(solVault)) != null) {
        return
    }
    const tx = await program.methods.addSol(true, sol_vault_bump, new anchor.BN(1e6), true, 6, 9)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            priceFeed: priceFeed,
            priceFeedProgram: priceFeedProgram,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();
}

export async function addToken() {
    try {
        await provider.connection.getTokenAccountBalance(tokenVault)
    } catch (e) {
        if (e.toString().indexOf('Invalid param: could not find account') >= 0) {
            console.log('need init token')
            console.log('delete bank keypair', bankKeypair.publicKey)
            console.log('recreate bank', bankKeypair.publicKey)
            bankKeypair = createKeypair(process.env.ANCHOR, 'bank');
            console.log('recreate tokenVaultAuthority');
            [tokenVaultAuthority, token_vault_authority_bump] = anchor.web3.PublicKey.findProgramAddressSync(
                [anchor.utils.bytes.utf8.encode("token_vault_authority"),
                    bankKeypair.publicKey.toBuffer()
                ],
                program.programId);
            console.log('recreate tokenVault');
            tokenVault = getAssociatedTokenAddressSync(mint.publicKey, tokenVaultAuthority, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

            const tx = await program.methods.addToken(true, token_vault_authority_bump, new anchor.BN(1e6), true, 6, 6)
                .accounts({
                    signer: walletKeypair.publicKey,
                    admin: admin,
                    bank: bankKeypair.publicKey,
                    tokenVaultAuthority: tokenVaultAuthority,
                    tokenVault: tokenVault,
                    tokenMint: mint.publicKey,
                    priceFeed: priceFeed,
                    priceFeedProgram: priceFeedProgram,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                }).signers([bankKeypair, walletKeypair]).rpc();

            return;
        }
        throw e;
    }
}

export async function depositSOL() {
    const amount = new anchor.BN(25);
    let solVaultBefore = await provider.connection.getBalance(solVault);
    let depositorBefore = await provider.connection.getBalance(walletKeypair.publicKey);

    const deposit_sol_tx = await program.methods.depositSol(amount)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc()
    // .catch(e => console.error(e))

    //console.log(deposit_sol_tx);

    //console.log(await provider.connection.getParsedTransaction('2bSezMXLCYJYvvNyYXzt5YNDm9mr58w8GKWWmPHE2HiLhFTV74pVoPr99x5WSvtpVLtszz4wTw2mya2b1a8b4TAa',{'commitment':'confirmed'}))
    //console.log(JSON.stringify(await provider.connection.getTransaction('2bSezMXLCYJYvvNyYXzt5YNDm9mr58w8GKWWmPHE2HiLhFTV74pVoPr99x5WSvtpVLtszz4wTw2mya2b1a8b4TAa',{'commitment':'confirmed'})))


    let solVaultAfter = await provider.connection.getBalance(solVault);
    let depositorAfter = await provider.connection.getBalance(walletKeypair.publicKey);
    // assert.equal(new anchor.BN(solVaultAfter).sub(new anchor.BN(solVaultBefore)).toString(), amount.toString())
    // assert.equal(new anchor.BN(depositorBefore).sub(new anchor.BN(depositorAfter)).toString(), amount.toString())
}

export async function withdrawSOL() {
    await sleep(1000);
    let amount = new anchor.BN(10);
    let solVaultBefore = await provider.connection.getBalance(solVault);
    let receiverBefore = await provider.connection.getBalance(userKeypair.publicKey);

    const withdraw_sol_tx = await program.methods.withdrawSol(amount, parseInt((Date.now() / 1000 + 10).toString()), parseInt((Date.now() / 1000).toString()))
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            receiver: userKeypair.publicKey,
            priceFeed: priceFeed,
            priceFeedProgram: priceFeedProgram,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc({
            skipPreflight: true
        })
    //.catch(e => console.error(e))


    let solVaultAfter = await provider.connection.getBalance(solVault);
    let receiverAfter = await provider.connection.getBalance(userKeypair.publicKey);

    assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.toString())
}

export async function updateGlobalWithdrawEnabled() {
    const tx = await program.methods.updateGlobalWithdrawEnabled(true)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();

    //console.log("Your transaction signature", tx);

    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function updateHourlyLimit() {
    const tx = await program.methods.updateHourlyLimit(new anchor.BN(100e8))
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();

    //console.log("Your transaction signature", tx);

    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function changeOperator() {
    const tx = await program.methods.changeOperator(operatorKeypair.publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();

    //console.log("Your transaction signature", tx);

    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function changeCounterParty() {
    const tx = await program.methods.changeCounterParty(counterPartyKeypair.publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();

    //console.log("Your transaction signature", tx);

    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function changeTruthHolder() {
    const tx = await program.methods.changeTruthHolder(walletKeypair.publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();

    //console.log("Your transaction signature", tx);
}

export async function changeAuthority() {
    const tx = await program.methods.changeAuthority(walletKeypair.publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();

    //console.log("Your transaction signature", tx);

}

export async function changePriceFeedProgram() {
    const tx = await program.methods.changePriceFeedProgram(priceFeedProgram)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();
}

export async function updateTokenEnable() {
    const tx = await program.methods.updateTokenEnabled(true)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            bank: bankKeypair.publicKey,
            tokenVaultAuthority: tokenVaultAuthority,
            tokenVault: tokenVault,
            tokenMint: mint.publicKey,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();
}

export async function updateSolEnable() {
    const tx = await program.methods.updateSolEnabled(true)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();
}


export async function depositToken() {
    let amount = new anchor.BN(25e6);
    let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
    let depositorBefore = await provider.connection.getTokenAccountBalance(userToken);

    let deposit_token_tx = await program.methods.depositToken(amount).accounts(
        {
            signer: walletKeypair.publicKey,
            admin: admin,
            bank: bankKeypair.publicKey,
            tokenVaultAuthority: tokenVaultAuthority,
            tokenVault: tokenVault,
            depositor: userToken,
            tokenMint: mint.publicKey,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,

        }
    ).signers([walletKeypair]).rpc();

    let tokenVaultAfter = await provider.connection.getTokenAccountBalance(tokenVault);
    let depositorAfter = await provider.connection.getTokenAccountBalance(userToken);

    assert.equal(new anchor.BN(depositorBefore.value.amount).sub(new anchor.BN(depositorAfter.value.amount)).toString(), amount.toString())
    assert.equal(new anchor.BN(tokenVaultAfter.value.amount).sub(new anchor.BN(tokenVaultBefore.value.amount)).toString(), amount.toString())

}

export async function withdrawToken() {
    await sleep(1000);
    let amount = new anchor.BN(1e6);
    let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverBefore = await provider.connection.getTokenAccountBalance(userToken);

    let withdraw_token_tx = await program.methods.withdrawToken(amount, new anchor.BN(Date.now() / 1000 + 10), new anchor.BN(Date.now() / 1000)).accounts({
        signer: walletKeypair.publicKey,
        admin: admin,
        bank: bankKeypair.publicKey,
        tokenVaultAuthority: tokenVaultAuthority,
        tokenVault: tokenVault,
        receiver: userToken,
        priceFeed: priceFeed,
        priceFeedProgram: priceFeedProgram,
        tokenMint: mint.publicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([walletKeypair]).rpc();

    let tokenVaultAfter = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverAfter = await provider.connection.getTokenAccountBalance(userToken);

    assert.equal(new anchor.BN(tokenVaultBefore.value.amount).sub(new anchor.BN(tokenVaultAfter.value.amount)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter.value.amount).sub(new anchor.BN(receiverBefore.value.amount)).toString(), amount.toString())

}

export async function withdrawTokenBySignature() {
    await sleep(1000);
    let now = Date.now();
    let idempotent = new anchor.BN(now / 1000);
    let deadLine = new anchor.BN((Date.now() / 1000 + 10));
    let amount = new anchor.BN(10e6);

    let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverBefore = await provider.connection.getTokenAccountBalance(userToken);

    const msg = Buffer.concat([
        Buffer.from(idempotent.toString()),
        Buffer.from(","),
        admin.toBytes(),
        Buffer.from(","),
        Buffer.from(deadLine.toString()),
        Buffer.from(","),
        bankKeypair.publicKey.toBytes(),
        Buffer.from(","),
        Buffer.from(amount.toString()),
        Buffer.from(","),
        tokenVaultAuthority.toBytes(),
        Buffer.from(","),
        tokenVault.toBytes(),
        Buffer.from(","),
        userToken.toBytes(),
        Buffer.from(","),
        priceFeed.toBytes(),
        Buffer.from(","),
        priceFeedProgram.toBytes(),
        Buffer.from(","),
        mint.publicKey.toBytes()
    ])

    let messageHash = createKeccakHash('keccak256').update(msg).digest('hex')
    let messageHashUint8Array = Buffer.from(messageHash, 'hex').valueOf()

    const publicKey = new PublicKey(walletKeypair.publicKey.toBase58()).toBytes();
    const privateKey = walletKeypair.secretKey;

    const signatureUint8Array = await ed.sign(messageHashUint8Array, privateKey.slice(0, 32));
    let signature = Buffer.from(signatureUint8Array).toString("hex");
    const isValid = await ed.verify(signatureUint8Array, messageHashUint8Array, publicKey);
    assert.ok(isValid)

    let withdraw_token_tx = await program.methods.withdrawTokenBySignature(amount, deadLine, idempotent, Buffer.from(signatureUint8Array).toJSON().data).accounts({
        signer: walletKeypair.publicKey,
        admin: admin,
        bank: bankKeypair.publicKey,
        tokenVaultAuthority: tokenVaultAuthority,
        tokenVault: tokenVault,
        receiver: userToken,
        priceFeed: priceFeed,
        priceFeedProgram: priceFeedProgram,
        tokenMint: mint.publicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    }).preInstructions([Ed25519Program.createInstructionWithPublicKey({
        publicKey: publicKey,
        message: messageHashUint8Array,
        signature: signatureUint8Array,
    })]).signers([walletKeypair]).rpc()
    // .catch(e => console.error(e))

    let tokenVaultAfter = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverAfter = await provider.connection.getTokenAccountBalance(userToken);

    assert.equal(new anchor.BN(tokenVaultBefore.value.amount).sub(new anchor.BN(tokenVaultAfter.value.amount)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter.value.amount).sub(new anchor.BN(receiverBefore.value.amount)).toString(), amount.toString())

}

export async function withdrawSOLBySignature() {
    await sleep(1000);
    let now = Date.now();
    let idempotent = new anchor.BN(now / 1000);
    let deadLine = new anchor.BN((Date.now() / 1000 + 10));
    let amount = new anchor.BN(10);

    await doWithdrawSolBySignature(idempotent, deadLine, amount)
}

export async function withdrawSOLToCounterParty() {
    let amount = new anchor.BN(1);
    let solVaultBefore = await provider.connection.getBalance(solVault);
    let receiverBefore = await provider.connection.getBalance(counterPartyKeypair.publicKey);

    const withdraw_sol_tx = await program.methods.withdrawSolToCounterParty(amount)
        .accounts({
            signer: operatorKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            receiver: counterPartyKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([operatorKeypair]).rpc({
            skipPreflight: true
        });
    let solVaultAfter = await provider.connection.getBalance(solVault);
    let receiverAfter = await provider.connection.getBalance(counterPartyKeypair.publicKey);

    assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.toString())
}

export async function withdrawTokenToCounterParty() {
    let amount = new anchor.BN(1e6);
    let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverBefore = await provider.connection.getTokenAccountBalance(counterPartyToken);

    let withdraw_token_tx = await program.methods.withdrawTokenToCounterParty(amount).accounts({
        signer: operatorKeypair.publicKey,
        admin: admin,
        bank: bankKeypair.publicKey,
        tokenVaultAuthority: tokenVaultAuthority,
        tokenVault: tokenVault,
        receiver: counterPartyToken,
        tokenMint: mint.publicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([operatorKeypair]).rpc({
        skipPreflight: true
    });

    let tokenVaultAfter = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverAfter = await provider.connection.getTokenAccountBalance(counterPartyToken);

    assert.equal(new anchor.BN(tokenVaultBefore.value.amount).sub(new anchor.BN(tokenVaultAfter.value.amount)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter.value.amount).sub(new anchor.BN(receiverBefore.value.amount)).toString(), amount.toString())

}

async function doWithdrawSolBySignature(idempotent: anchor.BN, deadLine: anchor.BN, amount: anchor.BN) {
    let solVaultBefore = await provider.connection.getBalance(solVault);
    let receiverBefore = await provider.connection.getBalance(userKeypair.publicKey);

    const msg = Buffer.concat([
        Buffer.from(idempotent.toString()),
        Buffer.from(","),
        admin.toBytes(),
        Buffer.from(","),
        Buffer.from(deadLine.toString()),
        Buffer.from(","),
        solVault.toBytes(),
        Buffer.from(","),
        Buffer.from(amount.toString()),
        Buffer.from(","),
        userKeypair.publicKey.toBytes(),
        Buffer.from(","),
        priceFeed.toBytes(),
        Buffer.from(","),
        priceFeedProgram.toBytes(),
    ])

    let messageHash = createKeccakHash('keccak256').update(msg).digest('hex')
    let messageHashUint8Array = Buffer.from(messageHash, 'hex').valueOf()

    const publicKey = new PublicKey(walletKeypair.publicKey.toBase58()).toBytes();
    const privateKey = walletKeypair.secretKey;

    const signatureUint8Array = await ed.sign(messageHashUint8Array, privateKey.slice(0, 32));
    let signature = Buffer.from(signatureUint8Array).toString("hex");
    const isValid = await ed.verify(signatureUint8Array, messageHashUint8Array, publicKey);
    assert.ok(isValid)

    let withdraw_token_tx = await program.methods.withdrawSolBySignature(amount, deadLine, idempotent, Buffer.from(signatureUint8Array).toJSON().data).accounts({
        signer: walletKeypair.publicKey,
        admin: admin,
        solVault: solVault,
        receiver: userKeypair.publicKey,
        priceFeed: priceFeed,
        priceFeedProgram: priceFeedProgram,
        systemProgram: anchor.web3.SystemProgram.programId,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    }).preInstructions([Ed25519Program.createInstructionWithPublicKey({
        publicKey: publicKey,
        message: messageHashUint8Array,
        signature: signatureUint8Array,
    })]).signers([walletKeypair]).rpc()
    // .catch(e => console.error(e))

    let solVaultAfter = await provider.connection.getBalance(solVault);
    let receiverAfter = await provider.connection.getBalance(userKeypair.publicKey);

    assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.toString())
}
