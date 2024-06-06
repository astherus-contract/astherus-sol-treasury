import {
    getOrCreateKeypair,
    createKeypair,
    getKeypair,
    saveKeypair,
    savePublicKey,
    loadPublicKey,
    getOrCreatePublicKey
} from "./utils";
import {ComputeBudgetProgram, Ed25519Program, Keypair, PublicKey} from "@solana/web3.js";
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
import * as borsh from 'borsh';
import * as base58 from 'bs58';
import process from "process";


const createKeccakHash = require('keccak')

let provider;
let programWallet;
let program;


let bankKeypair;
let bankPublicKey;
let walletKeypair;
let operatorKeypair;
let counterPartyKeypair;
let operatorPublicKey;
let counterPartyPublicKey;
let testUserKeypair;
let tokenPriceFeed;
let solPriceFeed;
let priceFeedProgram;
let tokenMintPublicKey;
let admin;
let admin_bump;
let tokenVaultAuthority;
let tokenVaultAuthorityBump;
let solVault;
let solVaultBump;
let tokenVault;
let userToken;
let counterPartyToken;
let removeClaimHistoryKeypair
let removeClaimHistoryPublicKey

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
        savePublicKey(process.env.ANCHOR, 'programWallet', programWallet.publicKey);
    }
    program = anchor.workspace.CloudSolTreasury as Program<CloudSolTreasury>;
    //console.log(program.programId)
}

export async function loadCommonKeypair() {
    walletKeypair = programWallet;
    if (process.env.ANCHOR == 'prod') {
        counterPartyPublicKey = loadPublicKey(process.env.ANCHOR, 'counterParty');
        operatorPublicKey = loadPublicKey(process.env.ANCHOR, 'operator');
        priceFeedProgram = loadPublicKey(process.env.ANCHOR, 'priceFeedProgram');
        removeClaimHistoryPublicKey = loadPublicKey(process.env.ANCHOR, 'removeClaimHistory');
    } else {
        counterPartyKeypair = getOrCreateKeypair(process.env.ANCHOR, 'counterParty');
        operatorKeypair = getOrCreateKeypair(process.env.ANCHOR, 'operator');
        counterPartyPublicKey = counterPartyKeypair.publicKey;
        operatorPublicKey = operatorKeypair.publicKey;
        priceFeedProgram = getOrCreatePublicKey(process.env.ANCHOR, 'priceFeedProgram');
        removeClaimHistoryKeypair = getOrCreateKeypair(process.env.ANCHOR, 'removeClaimHistory');
        testUserKeypair = getOrCreateKeypair(process.env.ANCHOR, 'testUser');
    }

    [admin, admin_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("admin")
        ],
        program.programId);
    savePublicKey(process.env.ANCHOR, 'admin', admin);

}

export async function loadSolKeypair() {
    [solVault, solVaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("sol_vault"), admin.toBuffer()
        ],
        program.programId);
    savePublicKey(process.env.ANCHOR, 'solVault', solVault);

    if (process.env.ANCHOR == 'prod') {
        solPriceFeed = loadPublicKey(process.env.ANCHOR, 'solPriceFeed');
    } else {
        solPriceFeed = getOrCreatePublicKey(process.env.ANCHOR, 'solPriceFeed');
    }
}


export async function loadTokenKeypair() {
    bankPublicKey = loadPublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'bank');
    if (bankPublicKey == null) {
        console.log('create bankKeypair')
        bankKeypair = getOrCreateKeypair(process.env.ANCHOR, process.env.tokenName + '-' + 'bank');
    }

    if (process.env.ANCHOR == 'prod') {
        tokenPriceFeed = loadPublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'priceFeed');
    } else {
        tokenPriceFeed = getOrCreatePublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'priceFeed');
    }

    [tokenVaultAuthority, tokenVaultAuthorityBump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("token_vault_authority"),
            bankPublicKey.toBuffer()
        ],
        program.programId);
    savePublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'tokenVaultAuthority', tokenVaultAuthority);
    tokenMintPublicKey = loadPublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'tokenMint');
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
        await requestAirdrop(testUserKeypair.publicKey);
    } catch (e) {
        console.log(e)
    }
    try {
        await requestAirdrop(operatorPublicKey);
    } catch (e) {
        console.log(e)
    }

    try {
        await requestAirdrop(counterPartyPublicKey);
    } catch (e) {
        console.log(e)
    }

    try {
        await requestAirdrop(removeClaimHistoryPublicKey);
    } catch (e) {
        console.log(e)
    }
}

export async function prepareToken() {
    try {
        if (tokenMintPublicKey == null) {
            throw new Error('TokenAccountNotFoundError')
        }
        await getMint(provider.connection, tokenMintPublicKey, null, TOKEN_PROGRAM_ID);
    } catch (e) {
        // console.log(e)
        if (process.env.ANCHOR == 'prod') {
            throw new Error('prod env not auto create mint')
        }
        if (e.toString().indexOf('TokenAccountNotFoundError') < 0) {
            throw e;
        }
        let tokenMint = getOrCreateKeypair(process.env.ANCHOR, process.env.tokenName + '-' + 'tokenMint');
        await createMint(
            provider.connection,
            walletKeypair,
            walletKeypair.publicKey,
            walletKeypair.publicKey,
            6,
            tokenMint,
            null,
            TOKEN_PROGRAM_ID
        );
        tokenMintPublicKey = tokenMint.publicKey;
        let userTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, tokenMintPublicKey, walletKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
        savePublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'testTokenAccount', userTokenAccount.address);
        await mintToChecked(provider.connection, walletKeypair, tokenMintPublicKey, userTokenAccount.address, walletKeypair.publicKey, 20000000000000e6, 6, [], undefined, TOKEN_PROGRAM_ID);
    }

    tokenVault = getAssociatedTokenAddressSync(tokenMintPublicKey, tokenVaultAuthority, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    savePublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'tokenVault', tokenVault);

    if (process.env.ANCHOR != 'prod') {
        let userTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, tokenMintPublicKey, walletKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
        savePublicKey(process.env.ANCHOR, process.env.tokenName + '-' + 'testTokenAccount', userTokenAccount.address);

        counterPartyToken = (await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, tokenMintPublicKey, counterPartyPublicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)).address;
        userToken = userTokenAccount.address;
    }
}

export async function initialize() {
    if ((await provider.connection.getAccountInfo(admin)) != null) {
        return
    }
    const tx = await program.methods.initialize(true, new anchor.BN(100e8), walletKeypair.publicKey, walletKeypair.publicKey, walletKeypair.publicKey, priceFeedProgram, removeClaimHistoryPublicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]).signers([walletKeypair]).rpc();
}

export async function addSol() {
    if ((await provider.connection.getAccountInfo(solVault)) != null) {
        return
    }
    const tx = await program.methods.addSol(true, solVaultBump, new anchor.BN(1e6), true, 6, 9)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            priceFeed: solPriceFeed,
            priceFeedProgram: priceFeedProgram,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]).signers([walletKeypair]).rpc();
}

export async function addToken() {
    try {
        await provider.connection.getTokenAccountBalance(tokenVault)
    } catch (e) {
        if (e.toString().indexOf('Invalid param: could not find account') >= 0) {
            console.log('need init token')
            // console.log('delete bank keypair', bankKeypair.publicKey)
            // console.log('recreate bank', bankKeypair.publicKey)
            // bankKeypair = createKeypair(process.env.ANCHOR, process.env.tokenName + '-' + 'bank');
            // console.log('recreate tokenVaultAuthority');
            // [tokenVaultAuthority, tokenVaultAuthorityBump] = anchor.web3.PublicKey.findProgramAddressSync(
            //     [anchor.utils.bytes.utf8.encode("token_vault_authority"),
            //         bankKeypair.publicKey.toBuffer()
            //     ],
            //     program.programId);
            // console.log('recreate tokenVault');
            //
            //
            // tokenVault = getAssociatedTokenAddressSync(tokenMintPublicKey, tokenVaultAuthority, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

            const tx = await program.methods.addToken(true, tokenVaultAuthorityBump, new anchor.BN(1e6), true, 6, 6)
                .accounts({
                    signer: walletKeypair.publicKey,
                    admin: admin,
                    bank: bankPublicKey,
                    tokenVaultAuthority: tokenVaultAuthority,
                    tokenVault: tokenVault,
                    tokenMint: tokenMintPublicKey,
                    priceFeed: tokenPriceFeed,
                    priceFeedProgram: priceFeedProgram,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 2000000,
                })]).signers([bankKeypair, walletKeypair]).rpc();

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
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]).signers([walletKeypair]).rpc()
    // .catch(e => console.error(e))

    //console.log(deposit_sol_tx);

    //console.log(await provider.connection.getParsedTransaction('2bSezMXLCYJYvvNyYXzt5YNDm9mr58w8GKWWmPHE2HiLhFTV74pVoPr99x5WSvtpVLtszz4wTw2mya2b1a8b4TAa',{'commitment':'confirmed'}))
    //console.log(JSON.stringify(await provider.connection.getTransaction('2bSezMXLCYJYvvNyYXzt5YNDm9mr58w8GKWWmPHE2HiLhFTV74pVoPr99x5WSvtpVLtszz4wTw2mya2b1a8b4TAa',{'commitment':'confirmed'})))


    let solVaultAfter = await provider.connection.getBalance(solVault);
    let depositorAfter = await provider.connection.getBalance(walletKeypair.publicKey);
    // assert.equal(new anchor.BN(solVaultAfter).sub(new anchor.BN(solVaultBefore)).toString(), amount.toString())
    // assert.equal(new anchor.BN(depositorBefore).sub(new anchor.BN(depositorAfter)).toString(), amount.toString())
}

export async function updateGlobalWithdrawEnabled(enabled = true) {
    const method = program.methods.updateGlobalWithdrawEnabled(enabled)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);
    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function updateHourlyLimit(hourlyLimit = new anchor.BN(10000e8)) {
    const method = program.methods.updateHourlyLimit(hourlyLimit)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);

    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function changeOperator(publicKey = operatorPublicKey) {
    const method = program.methods.changeOperator(publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);

    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function changeCounterParty(publicKey = counterPartyPublicKey) {
    const method = program.methods.changeCounterParty(publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);

    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
    // let result = await program.account.admin.fetch(adminKeypair.publicKey);
    // console.log(result);
}

export async function changeTruthHolder(publicKey = walletKeypair.publicKey) {
    const method = program.methods.changeTruthHolder(publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);
    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
}

export async function changeAuthority(publicKey = walletKeypair.publicKey) {
    const method = program.methods.changeAuthority(publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);
    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
}

export async function changePriceFeedProgram(publicKey = priceFeedProgram) {
    const method = program.methods.changePriceFeedProgram(publicKey)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);

    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
}

export async function updateTokenEnable(enabled = true) {
    const method = program.methods.updateTokenEnabled(enabled)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            bank: bankPublicKey,
            tokenVaultAuthority: tokenVaultAuthority,
            tokenVault: tokenVault,
            tokenMint: tokenMintPublicKey,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);

    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
}

export async function updateSolEnable(enabled = true) {
    const method = program.methods.updateSolEnabled(enabled)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]);

    if (process.env.ONLY_BUILD_INSTRUCTION == 'true') {
        let instruction = await method.instruction();
        console.log("Your instruction", base58.encode(Uint8Array.from(instruction.data)));
    } else {
        const tx = await method.signers([walletKeypair]).rpc();
        //console.log("Your transaction signature", tx);
    }
}


export async function depositToken() {
    let amount = new anchor.BN(25e6);
    let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
    let depositorBefore = await provider.connection.getTokenAccountBalance(userToken);

    let deposit_token_tx = await program.methods.depositToken(amount).accounts(
        {
            signer: walletKeypair.publicKey,
            admin: admin,
            bank: bankPublicKey,
            tokenVaultAuthority: tokenVaultAuthority,
            tokenVault: tokenVault,
            depositor: userToken,
            tokenMint: tokenMintPublicKey,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,

        }
    ).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2000000,
    })]).signers([walletKeypair]).rpc();

    let tokenVaultAfter = await provider.connection.getTokenAccountBalance(tokenVault);
    let depositorAfter = await provider.connection.getTokenAccountBalance(userToken);

    assert.equal(new anchor.BN(depositorBefore.value.amount).sub(new anchor.BN(depositorAfter.value.amount)).toString(), amount.toString())
    assert.equal(new anchor.BN(tokenVaultAfter.value.amount).sub(new anchor.BN(tokenVaultBefore.value.amount)).toString(), amount.toString())

}

export async function withdrawTokenBySignature() {
    let now = Date.now();
    let idempotent = new anchor.BN(now);
    let deadLine = parseInt((Date.now() / 1000 + 10).toString());
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
        bankPublicKey.toBytes(),
        Buffer.from(","),
        Buffer.from(amount.toString()),
        Buffer.from(","),
        tokenVaultAuthority.toBytes(),
        Buffer.from(","),
        tokenVault.toBytes(),
        Buffer.from(","),
        userToken.toBytes(),
        Buffer.from(","),
        tokenPriceFeed.toBytes(),
        Buffer.from(","),
        priceFeedProgram.toBytes(),
        Buffer.from(","),
        tokenMintPublicKey.toBytes()
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
        bank: bankPublicKey,
        tokenVaultAuthority: tokenVaultAuthority,
        tokenVault: tokenVault,
        receiver: userToken,
        priceFeed: tokenPriceFeed,
        priceFeedProgram: priceFeedProgram,
        tokenMint: tokenMintPublicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2000000,
    }), Ed25519Program.createInstructionWithPublicKey({
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

export async function withdrawTokenBySignatureUserKey() {
    let pub = new PublicKey(base58.encode(Uint8Array.from(Buffer.from('ee0b78103520825749376d462b15359316ef69472dda9a19e58b05de4eee8653', 'hex'))))
    let userKeypair = Keypair.fromSecretKey(base58.decode('5ErtWur8wM4Zor8s2JBMQRWYDDujnowYQQ5n1N5SMigs5CDmNYFYapmyu8aZx3w6JNzeccXWMSmWW9NZs9v3rYmi'));
    let idempotent = new anchor.BN(171449763829156);
    let deadLine = parseInt((1714497758).toString());
    let amount = new anchor.BN(5);

    let userUsdtTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, tokenMintPublicKey, userKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    userToken = userUsdtTokenAccount.address;
    let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverBefore = await provider.connection.getTokenAccountBalance(userToken);

    const msg = Buffer.concat([
        Buffer.from(idempotent.toString()),
        Buffer.from(","),
        admin.toBytes(),
        Buffer.from(","),
        Buffer.from(deadLine.toString()),
        Buffer.from(","),
        bankPublicKey.toBytes(),
        Buffer.from(","),
        Buffer.from(amount.toString()),
        Buffer.from(","),
        tokenVaultAuthority.toBytes(),
        Buffer.from(","),
        tokenVault.toBytes(),
        Buffer.from(","),
        userToken.toBytes(),
        Buffer.from(","),
        tokenPriceFeed.toBytes(),
        Buffer.from(","),
        priceFeedProgram.toBytes(),
        Buffer.from(","),
        tokenMintPublicKey.toBytes()
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
        bank: bankPublicKey,
        tokenVaultAuthority: tokenVaultAuthority,
        tokenVault: tokenVault,
        receiver: userToken,
        priceFeed: tokenPriceFeed,
        priceFeedProgram: priceFeedProgram,
        tokenMint: tokenMintPublicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2000000,
    }), Ed25519Program.createInstructionWithPublicKey({
        publicKey: pub.toBytes(),
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
    let now = Date.now();
    let idempotent = new anchor.BN(now);
    let deadLine = parseInt((Date.now() / 1000 + 10).toString());
    let amount = new anchor.BN(10);

    await doWithdrawSolBySignature(idempotent, deadLine, amount)
}

export async function withdrawSOLToCounterParty() {
    let amount = new anchor.BN(1);
    let solVaultBefore = await provider.connection.getBalance(solVault);
    let receiverBefore = await provider.connection.getBalance(counterPartyPublicKey);

    const withdraw_sol_tx = await program.methods.withdrawSolToCounterParty(amount)
        .accounts({
            signer: operatorPublicKey,
            admin: admin,
            solVault: solVault,
            receiver: counterPartyPublicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 2000000,
        })]).signers([operatorKeypair]).rpc({
            skipPreflight: true
        });
    let solVaultAfter = await provider.connection.getBalance(solVault);
    let receiverAfter = await provider.connection.getBalance(counterPartyPublicKey);

    assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.toString())
}

export async function withdrawTokenToCounterParty() {
    let amount = new anchor.BN(1e6);
    let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverBefore = await provider.connection.getTokenAccountBalance(counterPartyToken);

    let withdraw_token_tx = await program.methods.withdrawTokenToCounterParty(amount).accounts({
        signer: operatorPublicKey,
        admin: admin,
        bank: bankPublicKey,
        tokenVaultAuthority: tokenVaultAuthority,
        tokenVault: tokenVault,
        receiver: counterPartyToken,
        tokenMint: tokenMintPublicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2000000,
    })]).signers([operatorKeypair]).rpc({
        skipPreflight: true
    });

    let tokenVaultAfter = await provider.connection.getTokenAccountBalance(tokenVault);
    let receiverAfter = await provider.connection.getTokenAccountBalance(counterPartyToken);

    assert.equal(new anchor.BN(tokenVaultBefore.value.amount).sub(new anchor.BN(tokenVaultAfter.value.amount)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter.value.amount).sub(new anchor.BN(receiverBefore.value.amount)).toString(), amount.toString())

}

async function doWithdrawSolBySignature(idempotent: anchor.BN, deadLine: number, amount: anchor.BN) {
    let solVaultBefore = await provider.connection.getBalance(solVault);
    let receiverBefore = await provider.connection.getBalance(testUserKeypair.publicKey);

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
        testUserKeypair.publicKey.toBytes(),
        Buffer.from(","),
        solPriceFeed.toBytes(),
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
        receiver: testUserKeypair.publicKey,
        priceFeed: solPriceFeed,
        priceFeedProgram: priceFeedProgram,
        systemProgram: anchor.web3.SystemProgram.programId,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2000000,
    }), Ed25519Program.createInstructionWithPublicKey({
        publicKey: publicKey,
        message: messageHashUint8Array,
        signature: signatureUint8Array,
    })]).signers([walletKeypair]).rpc()
    // .catch(e => console.error(e))

    let solVaultAfter = await provider.connection.getBalance(solVault);
    let receiverAfter = await provider.connection.getBalance(testUserKeypair.publicKey);

    assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.toString())
    assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.toString())
}

export async function removeSolClaimHistory(indexes: String) {
    await program.methods.removeSolClaimHistory(indexes).accounts({
        signer: removeClaimHistoryPublicKey,
        admin: admin,
        solVault: solVault,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2000000,
    })]).signers([removeClaimHistoryKeypair]).rpc({
        skipPreflight: true
    })
        .catch(e => console.error(e))
}

export async function removeTokenClaimHistory(indexes: String) {
    await program.methods.removeTokenClaimHistory(indexes).accounts({
        signer: removeClaimHistoryPublicKey,
        admin: admin,
        bank: bankPublicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).preInstructions([ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2000000,
    })]).signers([removeClaimHistoryKeypair]).rpc({
        skipPreflight: true
    })
}

async function getClaimHistory(address: PublicKey, name: String) {
    const uint32Array = Uint32Array.of(800);
    const uint8Array = new Uint8Array(uint32Array.buffer);
    const schema = {struct: {idempotent: {array: {type: 'u64'}}, deadLine: {array: {type: 'u32'}}}};
    let account = await provider.connection.getAccountInfo(address);
    const decoded = borsh.deserialize(schema, Buffer.concat([uint8Array, new Uint8Array(account.data.slice(8, 8 + 8 * 800)), uint8Array, new Uint8Array(account.data.slice(8 + 8 * 800, 8 + 8 * 800 + 4 * 800))]));

    console.log(`getClaimHistory address ${address.toBase58()},name ${name}`)
    for (let i = 0; i < 800; i++) {
        if (decoded["idempotent"][i] != 0 || decoded["deadLine"][i] != 0) {
            console.log(`idempotent:${decoded["idempotent"][i]},deadLine:${decoded["deadLine"][i]}`)
        }
    }
    console.log('')
}

export async function getTokenClaimHistory() {
    await getClaimHistory(bankPublicKey, process.env.tokenName + '-' + "bank");
}

export async function getSolClaimHistory() {
    await getClaimHistory(solVault, "solVault");
}

export async function fetchAdmin() {
    let result = await program.account.admin.fetch(admin);
    console.log('fetchAdmin ', result);
}

export async function fetchBank() {
    let result = await program.bank.fetch(bankPublicKey);
    console.log('fetchBank ', result);
}

export async function fetchSolVault() {
    let result = await program.account.solVault.fetch(solVault);
    console.log('fetchSolVault ', result);
}


