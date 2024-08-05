import * as anchor from "@coral-xyz/anchor";


import {Keypair, PublicKey} from "@solana/web3.js";

const createKeccakHash = require('keccak')
import * as assert from 'assert';
import base58 from "bs58";
import {changeTruthHolder} from "../app/cloud-sol-treasury";


describe("helper test", () => {
    it("convert", async () => {
        //json
        const secretKey = Uint8Array.from(JSON.parse(''));
        let keypair = Keypair.fromSecretKey(secretKey);
        console.log(keypair.publicKey.toBase58())
    });
    it("hex address", async () => {
        let pub = new PublicKey(base58.encode(Uint8Array.from(Buffer.from('781a97e47794f58c726377adb24637d18c2b3b88008129da32c70c3bb676a2d7', 'hex'))))
        console.log('pub address ' + pub.toBase58());
    });
})
