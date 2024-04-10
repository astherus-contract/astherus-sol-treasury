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

/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' walletKeypair
 */
let walletKeypair: Keypair;

/**
 * Hello world's program id
 */
let programId: PublicKey;

/**
 * The public key of the account we are saying hello to
 */
let greetedPubkey: PublicKey;

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../target/deploy/');

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'cloud_sol_treasury.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/helloworld.so`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'cloud_sol_treasury-keypair.json');

/**
 * The state of a greeting account managed by the hello world program
 */
class GreetingAccount {
  counter = 0;
  constructor(fields: {counter: number} | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}

/**
 * Borsh schema definition for greeting accounts
 */
const GreetingSchema = new Map([
  [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
]);

/**
 * The expected size of each greeting account.
 */
const GREETING_SIZE = borsh.serialize(
  GreetingSchema,
  new GreetingAccount(),
).length;

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
  let fees = 0;
  if (!walletKeypair) {
    const {feeCalculator} = await connection.getRecentBlockhash();

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    walletKeypair = await getPayer();
  }

  let lamports = await connection.getBalance(walletKeypair.publicKey);
  if (lamports < fees) {
    // If current balance is not enough to pay for fees, request an airdrop
    const sig = await connection.requestAirdrop(
      walletKeypair.publicKey,
      fees - lamports,
    );
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(walletKeypair.publicKey);
  }

  console.log(
    'Using account',
    walletKeypair.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees',
  );
}

/**
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(): Promise<void> {
  // Read program id from keypair file

  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);

    programId = programKeypair.publicKey;
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
  console.log(`Using program ${programId.toBase58()}`);

  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  const GREETING_SEED = 'hello';
  greetedPubkey = await PublicKey.createWithSeed(
    walletKeypair.publicKey,
    GREETING_SEED,
    programId,
  );

  // Check if the greeting account has already been created
  const greetedAccount = await connection.getAccountInfo(greetedPubkey);
  if (greetedAccount === null) {
    console.log(
      'Creating account',
      greetedPubkey.toBase58(),
      'to call',
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
      GREETING_SIZE,
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: walletKeypair.publicKey,
        basePubkey: walletKeypair.publicKey,
        seed: GREETING_SEED,
        newAccountPubkey: greetedPubkey,
        lamports,
        space: GREETING_SIZE,
        programId,
      }),
    );
    await sendAndConfirmTransaction(connection, transaction, [walletKeypair]);
  }
}

export async function requestAirdrop(publicKey: PublicKey) {
  let res = await connection.requestAirdrop(publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL);

  let latestBlockHash = await connection.getLatestBlockhash()

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: res,
  });
}



export async function initAccount(): Promise<void>{
  const [admin, admin_bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("admin")
      ],
      programId);
}

export async function initSolVaultAccount(): Promise<void>{
  const [solVault, sol_vault_bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("sol_vault"),
        bankKeypair.publicKey.toBuffer()
      ],
      program.programId);
}

export async function initUsdtVaultAccount(): Promise<void>{
  const bankKeypair = anchor.web3.Keypair.generate();

  const [tokenVaultAuthority, token_vault_authority_bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("token_vault_authority"),
        bankKeypair.publicKey.toBuffer()
      ],
      program.programId);
}

export async function createUsdtMint(): Promise<void>{
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

  let test = await getMint(provider.connection, mint.publicKey, null, TOKEN_PROGRAM_ID);
  //console.log("getMint", test);

  let deposit_auth_usdc_acct = await getOrCreateAssociatedTokenAccount(provider.connection, walletKeypair, mint.publicKey, walletKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

  //console.log("deposit_auth_usdc_acct", deposit_auth_usdc_acct);


  let mint_to_sig = await mintToChecked(provider.connection, walletKeypair, mint.publicKey, deposit_auth_usdc_acct.address, usdc_auth, 200e6, 0, [], undefined, TOKEN_PROGRAM_ID);

  //console.log("provider.connection.getBalance(deposit_auth_usdc_acct.address)", await provider.connection.getBalance(deposit_auth_usdc_acct.address));


  tokenVault = getAssociatedTokenAddressSync(mint.publicKey, tokenVaultAuthority, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  //userToken = getAssociatedTokenAddressSync(mint.publicKey, userKeypair.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  //userToken = (await getOrCreateAssociatedTokenAccount(provider.connection, userKeypair, mint.publicKey, userKeypair.publicKey, false, undefined, undefined, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)).address

  userToken = deposit_auth_usdc_acct.address;
}

