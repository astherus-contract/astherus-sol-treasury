import * as anchor from "@coral-xyz/anchor";


import {Keypair, PublicKey} from "@solana/web3.js";

const createKeccakHash = require('keccak')
import * as assert from 'assert';


describe("helper test", () => {
    it("convert", async () => {
        //json
        const secretKey = Uint8Array.from(JSON.parse(''));
        let keypair = Keypair.fromSecretKey(secretKey);
        console.log(keypair.publicKey.toBase58())
    });
})
