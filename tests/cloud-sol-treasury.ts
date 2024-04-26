import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {CloudSolTreasury} from "../target/types/cloud_sol_treasury";

const createKeccakHash = require('keccak')
import * as ed from '@noble/ed25519';
import * as assert from 'assert';
import sleep from 'await-sleep'


import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createMint,
    getAssociatedTokenAddressSync,
    getMint,
    getOrCreateAssociatedTokenAccount,
    mintToChecked,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {PublicKey, TokenAccountsFilter, ComputeBudgetProgram, Transaction, Ed25519Program} from "@solana/web3.js";
import {equal} from "assert";
import * as borsh from "borsh";

describe("cloud-sol-treasury", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const programWallet = (provider.wallet as anchor.Wallet).payer;

    const program = anchor.workspace.CloudSolTreasury as Program<CloudSolTreasury>;

    //const bankKeypair = anchor.web3.Keypair.fromSeed(Buffer.from("bankKeypair").valueOf());
    const bankKeypair = anchor.web3.Keypair.generate();

    //const walletKeypair = anchor.web3.Keypair.generate();

    const walletKeypair = programWallet;
    const counterPartyKeypair = anchor.web3.Keypair.generate();
    const operatorKeypair = anchor.web3.Keypair.generate();

    const userKeypair = anchor.web3.Keypair.generate();

    const removeClaimHistoryKeypair = anchor.web3.Keypair.generate();


    const priceFeed = anchor.web3.Keypair.generate().publicKey;
    const priceFeedProgram = anchor.web3.Keypair.generate().publicKey;


    const mint = anchor.web3.Keypair.generate();
    const usdc_auth = anchor.web3.Keypair.generate();

    const [admin, admin_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("admin")
        ],
        program.programId);

    const [tokenVaultAuthority, token_vault_authority_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("token_vault_authority"),
            bankKeypair.publicKey.toBuffer()
        ],
        program.programId);

    const [solVault, sol_vault_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("sol_vault"), admin.toBuffer()
        ],
        program.programId);

    let tokenVault;
    let userToken;
    let counterPartyToken;

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

    async function withdrawsSolBySignature(idempotent: anchor.BN, deadLine: number, amount: anchor.BN) {
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
        //.catch(e => console.error(e))

        let solVaultAfter = await provider.connection.getBalance(solVault);
        let receiverAfter = await provider.connection.getBalance(userKeypair.publicKey);

        assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.toString())
        assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.toString())
    }

    before(async () => {
        async function requestAirdrop(publicKey: PublicKey) {
            let res = await provider.connection.requestAirdrop(publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL);

            let latestBlockHash = await provider.connection.getLatestBlockhash()

            await provider.connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: res,
            });
        }

        await requestAirdrop(walletKeypair.publicKey);
        await requestAirdrop(userKeypair.publicKey);
        await requestAirdrop(operatorKeypair.publicKey);


        let token_mint = await createMint(
            provider.connection,
            walletKeypair,
            usdc_auth.publicKey,
            usdc_auth.publicKey,
            0,
            mint,
            null,
            TOKEN_PROGRAM_ID
        );

        //console.log("token_mint ", token_mint)
        //console.log("mint", mint.publicKey)


        let test = await getMint(provider.connection, mint.publicKey, null, TOKEN_PROGRAM_ID);
        //console.log("getMint", test);

        let deposit_auth_usdc_acct = await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, mint.publicKey, walletKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

        //console.log("deposit_auth_usdc_acct", deposit_auth_usdc_acct);


        let mint_to_sig = await mintToChecked(provider.connection, walletKeypair, mint.publicKey, deposit_auth_usdc_acct.address, usdc_auth, 200e6, 0, [], undefined, TOKEN_PROGRAM_ID);

        //console.log("provider.connection.getBalance(deposit_auth_usdc_acct.address)", await provider.connection.getBalance(deposit_auth_usdc_acct.address));


        tokenVault = getAssociatedTokenAddressSync(mint.publicKey, tokenVaultAuthority, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        //userToken = getAssociatedTokenAddressSync(mint.publicKey, userKeypair.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        //userToken = (await getOrCreateAssociatedTokenAccount(provider.connection, userKeypair, mint.publicKey, userKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)).address
        counterPartyToken = (await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, mint.publicKey, counterPartyKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)).address;
        userToken = deposit_auth_usdc_acct.address;
    });

    it("Is initialized", async () => {
        const tx = await program.methods.initialize(true, new anchor.BN(100e8), walletKeypair.publicKey, walletKeypair.publicKey, walletKeypair.publicKey, priceFeedProgram, removeClaimHistoryKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //.catch(e => console.error(e))
    });

    it("Is add sol", async () => {
        const tx = await program.methods.addSol(true, sol_vault_bump, new anchor.BN(1e6), true, 6, 9)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                solVault: solVault,
                priceFeed: priceFeed,
                priceFeedProgram: priceFeedProgram,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc()
            // .catch(e => console.error(e));
    });

    it("Is add token", async () => {
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

        //console.log("Your transaction signature", tx);

        // let result = await program.account.bank.fetch(bankKeypair.publicKey);
        // //console.log(result);
    });

    it("Deposits SOL", async () => {
        const amount = new anchor.BN(25 * anchor.web3.LAMPORTS_PER_SOL);
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

        let solVaultAfter = await provider.connection.getBalance(solVault);
        let depositorAfter = await provider.connection.getBalance(walletKeypair.publicKey);

        //console.log("diff ",depositorBefore-depositorAfter)
        //console.log("depositorBefore ",depositorBefore)
        //console.log("depositorAfter ",depositorAfter)

        assert.equal(new anchor.BN(solVaultAfter).sub(new anchor.BN(solVaultBefore)).toString(), amount.toString())
        // assert.equal(new anchor.BN(depositorBefore).sub(new anchor.BN(depositorAfter)).toString(), amount.toString())

    });

    it("Withdraws SOL", async () => {
        let amount = new anchor.BN(10 * anchor.web3.LAMPORTS_PER_SOL);
        let solVaultBefore = await provider.connection.getBalance(solVault);
        let receiverBefore = await provider.connection.getBalance(userKeypair.publicKey);

        const withdraw_sol_tx = await program.methods.withdrawSol(amount, Date.now()/1000 + 10, new anchor.BN(Date.now()))
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

        let solVaultAfter = await provider.connection.getBalance(solVault);
        let receiverAfter = await provider.connection.getBalance(userKeypair.publicKey);

        assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.toString())
        assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.toString())

    });

    it("Is updateGlobalWithdrawEnabled", async () => {
        const tx = await program.methods.updateGlobalWithdrawEnabled(true)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is updateHourlyLimit", async () => {
        const tx = await program.methods.updateHourlyLimit(new anchor.BN(100e8))
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is changeOperator", async () => {
        const tx = await program.methods.changeOperator(operatorKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is changeCounterParty", async () => {
        const tx = await program.methods.changeCounterParty(counterPartyKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is changeTruthHolder", async () => {
        const tx = await program.methods.changeTruthHolder(walletKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

    });

    it("Is changeAuthority", async () => {
        const tx = await program.methods.changeAuthority(walletKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

    });

    it("Is changePriceFeedProgram", async () => {
        const tx = await program.methods.changePriceFeedProgram(priceFeedProgram)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);

        // let result = await program.account.admin.all();
        // console.log("program.account.admin.all",result);
    });

    it("Is update token enable", async () => {
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

        //console.log("Your transaction signature", tx);

        // let result = await program.account.bank.fetch(bankKeypair.publicKey);
        // //console.log(result);
    });

    it("Is update sol enable", async () => {
        const tx = await program.methods.updateSolEnabled(true)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                solVault: solVault,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //console.log("Your transaction signature", tx);

        // let result = await program.account.bank.fetch(bankKeypair.publicKey);
        // //console.log(result);
    });

    it("Deposits Token", async () => {
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

    });

    it("Withdraws Token", async () => {
        // await sleep(1000);
        let amount = new anchor.BN(1e6);
        let tokenVaultBefore = await provider.connection.getTokenAccountBalance(tokenVault);
        let receiverBefore = await provider.connection.getTokenAccountBalance(userToken);

        let withdraw_token_tx = await program.methods.withdrawToken(amount, Date.now()/1000 + 10, new anchor.BN(Date.now())).accounts({
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

    });

    it("Withdraws Token BY signature", async () => {
        // await sleep(1000);
        let now = Date.now();

        let idempotent = new anchor.BN(now);
        let deadLine = parseInt((Date.now()/1000 + 10).toString());
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

    });

    it("Withdraws SOl BY signature", async () => {
        // await sleep(1000);
        let now = Date.now();
        let idempotent = new anchor.BN(Date.now());
        let deadLine = parseInt((Date.now()/1000 + 10).toString());
        let amount = new anchor.BN(10e6);

        await withdrawsSolBySignature(idempotent, deadLine, amount)
    });

    it("Withdraws SOL to Counter Party", async () => {
        let amount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
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

    });

    it("Withdraws Token To Counter Party", async () => {
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

    });

    it("check idempotent", async () => {
        let amount = new anchor.BN(10e6);
        let now = Date.now();
        let idempotent = new anchor.BN(now);
        let deadLine = parseInt((Date.now()/1000 + 10).toString());
        await withdrawsSolBySignature(idempotent, deadLine, amount)

        let solVaultBefore = await provider.connection.getBalance(solVault);
        let receiverBefore = await provider.connection.getBalance(userKeypair.publicKey);
        try {
            await withdrawsSolBySignature(idempotent, deadLine, amount)
        } catch (e) {
            let solVaultAfter = await provider.connection.getBalance(solVault);
            let receiverAfter = await provider.connection.getBalance(userKeypair.publicKey);
            assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), "0")
            assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), "0")
        }
    });

    it("remove sol claim history", async () => {
        let arr='1111,222'
        await program.methods.removeSolClaimHistory(arr).accounts({
            signer: removeClaimHistoryKeypair.publicKey,
            admin: admin,
            solVault: solVault,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([removeClaimHistoryKeypair]).rpc({
            skipPreflight: true
        })
        .catch(e => console.error(e))
    });

    it("remove token claim history", async () => {
        let arr='1111,222'
        await program.methods.removeTokenClaimHistory(arr).accounts({
            signer: removeClaimHistoryKeypair.publicKey,
            admin: admin,
            bank: bankKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([removeClaimHistoryKeypair]).rpc({
            skipPreflight: true
        })
            .catch(e => console.error(e))
    });

    xit("check deadLine", async () => {
        let i = 1;
        let amount = new anchor.BN(10e5);
        let start = Date.now();
        let solVaultBefore = await provider.connection.getBalance(solVault);
        let receiverBefore = await provider.connection.getBalance(userKeypair.publicKey);
        while (true) {
            //console.log(i)
            let now = Date.now();
            let idempotent = new anchor.BN(now);
            let deadLine = parseInt((Date.now()/1000 + 10).toString());
            try {
                await withdrawsSolBySignature(idempotent, deadLine, amount)
            } catch (e) {
                let solVaultAfter = await provider.connection.getBalance(solVault);
                let receiverAfter = await provider.connection.getBalance(userKeypair.publicKey);
                assert.equal(new anchor.BN(solVaultBefore).sub(new anchor.BN(solVaultAfter)).toString(), amount.mul(new anchor.BN(600)).toString())
                assert.equal(new anchor.BN(receiverAfter).sub(new anchor.BN(receiverBefore)).toString(), amount.mul(new anchor.BN(600)).toString())
                assert.equal(i, 601)
                assert.ok(e.toString().indexOf("Withdrawal exceeds maximum processing limit.") > 0)
                break;
            }
            i++
        }
        //console.log("cost ",Date.now()-start)
    });

    it("get ClaimHistory", async () => {
        await getClaimHistory(bankKeypair.publicKey,"bank");
        await getClaimHistory(solVault,"solVault");

    });


    xit("get all address info", async () => {
        //console.log("walletKeypair AccountInfo", walletKeypair.publicKey, await provider.connection.getAccountInfo(walletKeypair.publicKey));
        //console.log("adminKeypair AccountInfo", adminKeypair.publicKey, await provider.connection.getAccountInfo(adminKeypair.publicKey));
        //console.log("bankKeypair AccountInfo", bankKeypair.publicKey, await provider.connection.getAccountInfo(bankKeypair.publicKey));

        //console.log("getProgramAccounts", await provider.connection.getProgramAccounts(program.programId));
        //console.log("tokenVaultAuthority AccountInfo", tokenVaultAuthority, await provider.connection.getAccountInfo(tokenVaultAuthority));
        // console.log("solVault AccountInfo", solVault, await provider.connection.getAccountInfo(solVault));

        //console.log("program.programId", program.programId);
        // console.log("getParsedTokenAccountsByOwner", walletKeypair.publicKey, await provider.connection.getParsedTokenAccountsByOwner(walletKeypair.publicKey, {
        //     programId: TOKEN_PROGRAM_ID,
        // }));
        // console.log("solVault AccountInfo",await program.account.solVault.fetch(solVault));

        // console.log("solVault AccountInfo",await program.account.bank.fetch(bankKeypair.publicKey));
        console.log("solVault AccountInfo",await program.account.admin.fetch(admin));

    });

});
