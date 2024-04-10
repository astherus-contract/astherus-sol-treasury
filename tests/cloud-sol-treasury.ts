import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {CloudSolTreasury} from "../target/types/cloud_sol_treasury";

const createKeccakHash = require('keccak')
import * as ed from '@noble/ed25519';
import * as assert from 'assert';


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

describe("cloud-sol-treasury", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.getProvider();
    const program = anchor.workspace.CloudSolTreasury as Program<CloudSolTreasury>;

    const bankKeypair = anchor.web3.Keypair.generate();
    const walletKeypair = anchor.web3.Keypair.generate();
    const counterPartyKeypair = anchor.web3.Keypair.generate();
    const operatorKeypair = anchor.web3.Keypair.generate();

    const userKeypair = anchor.web3.Keypair.generate();

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
        [anchor.utils.bytes.utf8.encode("sol_vault"),
            bankKeypair.publicKey.toBuffer()
        ],
        program.programId);

    let tokenVault;
    let userToken;
    let counterPartyToken;

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

    it("Is initialized!", async () => {
        const tx = await program.methods.initialize(true, new anchor.BN(1000), walletKeypair.publicKey, walletKeypair.publicKey, walletKeypair.publicKey,priceFeedProgram)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        //.catch(e => console.error(e))

        //console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is createdBank!", async () => {
        const tx = await program.methods.addToken(true, token_vault_authority_bump, sol_vault_bump,new anchor.BN(1e6),true,0,new anchor.BN(6))
            .accounts({
                signer: walletKeypair.publicKey,
                bank: bankKeypair.publicKey,
                solVault: solVault,
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

        let result = await program.account.bank.fetch(bankKeypair.publicKey);
        //console.log(result);
    });

    it("Deposits SOL", async () => {
        const deposit_amount = new anchor.BN(25 * anchor.web3.LAMPORTS_PER_SOL);
        // console.log(userKeypair.publicKey)
        // console.log(bankKeypair.publicKey)
        // console.log(solVault)


        const deposit_sol_tx = await program.methods.depositSol(deposit_amount)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                bank: bankKeypair.publicKey,
                solVault: solVault,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();
        console.log(deposit_sol_tx);

        let sol_vault_balance = await provider.connection.getBalance(solVault);
        console.log(sol_vault_balance);

        // let result = await program.account.bank.fetch(walletKeypair.publicKey);
        // console.log(result);

    });

    it("Withdraws SOL", async () => {
        let amount = new anchor.BN(10 * anchor.web3.LAMPORTS_PER_SOL);

        console.log("solVault AccountInfo", solVault, await provider.connection.getAccountInfo(solVault));


        const withdraw_sol_tx = await program.methods.withdrawSol(amount, new anchor.BN(Date.now() + 1000 * 10), new anchor.BN(Date.now()))
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                bank: bankKeypair.publicKey,
                solVault: solVault,
                receiver: userKeypair.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc({
                skipPreflight: true
            });

        let userKeypair_balance = await provider.connection.getBalance(userKeypair.publicKey);
        console.log("userKeypair_balance", userKeypair_balance);

    });

    it("Is updateGlobalWithdrawEnabled!", async () => {
        const tx = await program.methods.updateGlobalWithdrawEnabled(true)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is updateHourlyLimit!", async () => {
        const tx = await program.methods.updateHourlyLimit(new anchor.BN(1000000))
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is changeOperator!", async () => {
        const tx = await program.methods.changeOperator(operatorKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is changeCounterParty!", async () => {
        const tx = await program.methods.changeCounterParty(counterPartyKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Is changeTruthHolder!", async () => {
        const tx = await program.methods.changeTruthHolder(walletKeypair.publicKey)
            .accounts({
                signer: walletKeypair.publicKey,
                admin: admin,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([walletKeypair]).rpc();

        console.log("Your transaction signature", tx);

        // let result = await program.account.admin.fetch(adminKeypair.publicKey);
        // console.log(result);
    });

    it("Deposits SPL Token", async () => {
        let deposit_spl_tx = await program.methods.depositSpl(new anchor.BN(25e6)).accounts(
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

        //console.log(deposit_spl_tx);

    });

    it("Withdraws SPL Token", async () => {
        let withdraw_spl_tx = await program.methods.withdrawSpl(new anchor.BN(1e6), new anchor.BN(Date.now() + 1000 * 10), new anchor.BN(Date.now())).accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            bank: bankKeypair.publicKey,
            tokenVaultAuthority: tokenVaultAuthority,
            tokenVault: tokenVault,
            receiver: userToken,
            tokenMint: mint.publicKey,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();

        //console.log(withdraw_spl_tx);

    });

    it("Withdraws SPL Token BY signature", async () => {
        let now = Date.now();
        let idempotent = new anchor.BN(now);
        let deadLine = new anchor.BN(Date.now() + 1000 * 10);
        let amount = new anchor.BN(1e6);

        //const msg = Buffer.from("hello")
        const msg = Buffer.concat([
            Buffer.from(idempotent.toString()),
            Buffer.from(deadLine.toString()),
            Buffer.from(amount.toString()),
            admin.toBytes(),
            bankKeypair.publicKey.toBytes(),
            tokenVaultAuthority.toBytes(),
            tokenVault.toBytes(),
            userToken.toBytes(),
            priceFeed.toBytes(),
            priceFeedProgram.toBytes(),
            mint.publicKey.toBytes()
        ])

        let messageHash = createKeccakHash('keccak256').update(msg).digest('hex')
        //console.log("messageHash", messageHash)
        let messageHashUint8Array = Buffer.from(messageHash, 'hex').valueOf()

        const publicKey = new PublicKey(walletKeypair.publicKey.toBase58()).toBytes();
        const privateKey = walletKeypair.secretKey;
        //console.log("publicKey", Buffer.from(publicKey).toString('hex'))

        const signatureUint8Array = await ed.sign(messageHashUint8Array, privateKey.slice(0, 32));
        let signature = Buffer.from(signatureUint8Array).toString("hex");
        //console.log("signature", signature)
        const isValid = await ed.verify(signatureUint8Array, messageHashUint8Array, publicKey);
        //console.log("isValid", isValid)
        assert.ok(isValid)

        let withdraw_spl_tx = await program.methods.withdrawSplBySignature(amount, deadLine, idempotent, Buffer.from(signatureUint8Array)).accounts({
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
        }).preInstructions(Ed25519Program.createInstructionWithPublicKey({
            publicKey: publicKey,
            message: messageHashUint8Array,
            signature: signatureUint8Array,
        })).signers([walletKeypair]).rpc().catch(e => console.error(e))
        //.catch(e => console.error(e))
    });

    it("Withdraws SOL to Counter Party", async () => {
        let amount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

        console.log("solVault AccountInfo", solVault, await provider.connection.getAccountInfo(solVault));


        const withdraw_sol_tx = await program.methods.withdrawSolToCounterParty(amount)
            .accounts({
                signer: operatorKeypair.publicKey,
                admin: admin,
                bank: bankKeypair.publicKey,
                solVault: solVault,
                receiver: counterPartyKeypair.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([operatorKeypair]).rpc({
                skipPreflight: true
            }).catch(e => console.error(e));

        let userKeypair_balance = await provider.connection.getBalance(userKeypair.publicKey);
        console.log("userKeypair_balance", userKeypair_balance);

    });

    it("Withdraws SPL Token To Counter Party", async () => {
        let withdraw_spl_tx = await program.methods.withdrawSplToCounterParty(new anchor.BN(1e6)).accounts({
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
        }).catch(e => console.error(e));

        //console.log(withdraw_spl_tx);

    });

    xit("get all address info", async () => {
        //console.log("walletKeypair AccountInfo", walletKeypair.publicKey, await provider.connection.getAccountInfo(walletKeypair.publicKey));
        //console.log("adminKeypair AccountInfo", adminKeypair.publicKey, await provider.connection.getAccountInfo(adminKeypair.publicKey));
        //console.log("bankKeypair AccountInfo", bankKeypair.publicKey, await provider.connection.getAccountInfo(bankKeypair.publicKey));

        //console.log("getProgramAccounts", await provider.connection.getProgramAccounts(program.programId));
        //console.log("tokenVaultAuthority AccountInfo", tokenVaultAuthority, await provider.connection.getAccountInfo(tokenVaultAuthority));
        console.log("solVault AccountInfo", solVault, await provider.connection.getAccountInfo(solVault));

        //console.log("program.programId", program.programId);
        console.log("getParsedTokenAccountsByOwner", walletKeypair.publicKey, await provider.connection.getParsedTokenAccountsByOwner(walletKeypair.publicKey, {
            programId: TOKEN_PROGRAM_ID,
        }));


    });

});
