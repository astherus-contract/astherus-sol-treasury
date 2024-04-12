/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';
import * as anchor from "@coral-xyz/anchor";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createMint, getAssociatedTokenAddressSync,
    getMint,
    getOrCreateAssociatedTokenAccount, mintToChecked,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {Program} from "@coral-xyz/anchor";
import {CloudSolTreasury} from "../target/types/cloud_sol_treasury";

let provider ;
let program;

let connection: Connection;


let walletKeypair: Keypair;
let bankKeypair;
let counterPartyKeypair;
let operatorKeypair;
let userKeypair;
let priceFeed;
let priceFeedProgram;
let programId: PublicKey;

let mint;
let usdc_auth;

let admin, admin_bump;

let tokenVaultAuthority, token_vault_authority_bump;

let solVault, sol_vault_bump;

let tokenVault;
let userToken;
let counterPartyToken;


const PROGRAM_PATH = path.resolve(__dirname, '../target/deploy/');
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'cloud_sol_treasury.so');
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'cloud_sol_treasury-keypair.json');

// /**
//  * The state of a greeting account managed by the hello world program
//  */
// class GreetingAccount {
//   counter = 0;
//   constructor(fields: {counter: number} | undefined = undefined) {
//     if (fields) {
//       this.counter = fields.counter;
//     }
//   }
// }
//
// /**
//  * Borsh schema definition for greeting accounts
//  */
// const GreetingSchema = new Map([
//   [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
// ]);
//
// /**
//  * The expected size of each greeting account.
//  */
// const GREETING_SIZE = borsh.serialize(
//   GreetingSchema,
//   new GreetingAccount(),
// ).length;

export async function establishConnection(): Promise<void> {
    const rpcUrl = await getRpcUrl();
    connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version);
}

// export async function establishPayer(): Promise<void> {
//   let fees = 0;
//   if (!walletKeypair) {
//     const {feeCalculator} = await connection.getRecentBlockhash();
//
//     // Calculate the cost to fund the greeter account
//     fees += await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);
//
//     // Calculate the cost of sending transactions
//     fees += feeCalculator.lamportsPerSignature * 100; // wag
//
//     walletKeypair = await getPayer();
//   }
//
//   let lamports = await connection.getBalance(walletKeypair.publicKey);
//   if (lamports < fees) {
//     // If current balance is not enough to pay for fees, request an airdrop
//     const sig = await connection.requestAirdrop(
//       walletKeypair.publicKey,
//       fees - lamports,
//     );
//     await connection.confirmTransaction(sig);
//     lamports = await connection.getBalance(walletKeypair.publicKey);
//   }
//
//   console.log(
//     'Using account',
//     walletKeypair.publicKey.toBase58(),
//     'containing',
//     lamports / LAMPORTS_PER_SOL,
//     'SOL to pay for fees',
//   );
// }

export async function checkProgram(): Promise<void> {
    // Read program id from keypair file

    try {
        const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);

        programId = programKeypair.publicKey;

        anchor.setProvider(anchor.AnchorProvider.env());
        const provider = anchor.getProvider();
        const program = anchor.workspace.CloudSolTreasury as Program<CloudSolTreasury>;


    } catch (err) {
        const errMsg = (err as Error).message;
        throw new Error(
            `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`anchor deploy\``,
        );
    }


    // Check if the program has been deployed
    const programInfo = await connection.getAccountInfo(programId);
    console.log(programInfo);

    if (programInfo === null) {
        if (fs.existsSync(PROGRAM_SO_PATH)) {
            throw new Error(
                'Program needs to be deployed with `anchor deploy`',
            );
        } else {
            throw new Error('Program needs to be built and deployed');
        }
    } else if (!programInfo.executable) {
        //throw new Error(`Program is not executable`);
    }
    console.log(`Using program ${programId.toBase58()}`)
}

async function requestAirdrop(publicKey: PublicKey) {
    let res = await connection.requestAirdrop(publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL);

    let latestBlockHash = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: res,
    });
}

export async function initAccount(): Promise<void> {
    [admin, admin_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("admin")
        ],
        programId);
    walletKeypair = anchor.web3.Keypair.generate();
    bankKeypair = anchor.web3.Keypair.generate();

    counterPartyKeypair = anchor.web3.Keypair.generate();
    operatorKeypair = anchor.web3.Keypair.generate();

    userKeypair = anchor.web3.Keypair.generate();

    priceFeed = anchor.web3.Keypair.generate().publicKey;
    priceFeedProgram = anchor.web3.Keypair.generate().publicKey;

    mint = anchor.web3.Keypair.generate();
    usdc_auth = anchor.web3.Keypair.generate();

    [admin, admin_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("admin")
        ],
        programId);

    [tokenVaultAuthority, token_vault_authority_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("token_vault_authority"),
            bankKeypair.publicKey.toBuffer()
        ],
        programId);

    [solVault, sol_vault_bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("sol_vault"),
            bankKeypair.publicKey.toBuffer()
        ],
        programId);


    await requestAirdrop(walletKeypair.publicKey);
    await requestAirdrop(userKeypair.publicKey);
    await requestAirdrop(operatorKeypair.publicKey);

    let token_mint = await createMint(
        connection,
        walletKeypair,
        usdc_auth.publicKey,
        usdc_auth.publicKey,
        0,
        mint,
        null,
        TOKEN_PROGRAM_ID
    );

    let test = await getMint(connection, mint.publicKey, null, TOKEN_PROGRAM_ID);
    let deposit_auth_usdc_acct = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, mint.publicKey, walletKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    let mint_to_sig = await mintToChecked(connection, walletKeypair, mint.publicKey, deposit_auth_usdc_acct.address, usdc_auth, 200e6, 0, [], undefined, TOKEN_PROGRAM_ID);
    tokenVault = getAssociatedTokenAddressSync(mint.publicKey, tokenVaultAuthority, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    counterPartyToken = (await getOrCreateAssociatedTokenAccount(connection, walletKeypair, mint.publicKey, counterPartyKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)).address;
    userToken = deposit_auth_usdc_acct.address;
}


async function initialized() {
    const tx = await program.methods.initialize(true, new anchor.BN(1000), walletKeypair.publicKey, walletKeypair.publicKey, walletKeypair.publicKey, priceFeedProgram)
        .accounts({
            signer: walletKeypair.publicKey,
            admin: admin,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([walletKeypair]).rpc();
}

async function createdBank() {
    const tx = await program.methods.addToken(true, token_vault_authority_bump, sol_vault_bump, new anchor.BN(1e6), true, 0, new anchor.BN(6))
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
}




const anchor = require("@project-serum/anchor");

// Configure the local cluster.
anchor.setProvider(anchor.AnchorProvider.local());

async function main() {
    // #region main
    // Read the generated IDL.
    const idl = JSON.parse(
        require("fs").readFileSync("./target/idl/my_project.json", "utf8")
    );

    // Address of the deployed program.
    const programId = new anchor.web3.PublicKey("2uAaYZESqWuvLfPaL9pwUY7g5cWY6oz6NEshreKvMDVD");

    // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);

    // Execute the RPC.
    await program.rpc.initialize();
    // #endregion main
}

console.log("Running client.");
main().then(() => console.log("Success"));
