
import {
  establishConnection,
  establishPayer,
  checkProgram,
  sayHello,
  reportGreetings,
} from './sol_treasury';
import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint, getAssociatedTokenAddressSync,
  getMint,
  getOrCreateAssociatedTokenAccount, mintToChecked,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

import {CloudSolTreasury} from "../target/types/cloud_sol_treasury";
import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

async function main() {
  console.log("Let's start...");

    //Establish connection to the cluster
    await establishConnection();

    // Determine who pays for the fees
    await establishPayer();

    // Check if the program has been deployed
    await checkProgram();

    await initAccount();

  await initUsdtAccount();

  await createUsdtMint();


  const program = anchor.workspace.CloudSolTreasury as Program<CloudSolTreasury>;



  const userKeypair = anchor.web3.Keypair.generate();


  const mint = anchor.web3.Keypair.generate();
  const usdc_auth = anchor.web3.Keypair.generate();





  let tokenVault;
  let userToken;




  await requestAirdrop(walletKeypair.publicKey);
  await requestAirdrop(userKeypair.publicKey);









  //
  // // Say hello to an account
  // await sayHello();
  //
  // // Find out how many times that account has been greeted
  // await reportGreetings();

  console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
