import {secp256k1} from '@noble/curves/secp256k1';
import * as anchor from "@coral-xyz/anchor";

import * as ed from '@noble/ed25519';
import {PublicKey} from "@solana/web3.js";

const createKeccakHash = require('keccak')
import * as assert from 'assert';


/**
 * https://www.npmjs.com/package/@noble/ed25519/v/1.7.1
 */
describe("ed25519 test", () => {

    it("ed25519 test", async () => {
        const walletKeypair = anchor.web3.Keypair.fromSecretKey(Buffer.from("54c6a10324cc4bcd81aaf99d345eea24fa7d4dc4a5d6d69df133d8a214b713a9c3e32249ee43ae11ac178f8f02bf23e9cf446fdf8dbea96f5ad3a5ac38062edb",'hex').valueOf())

        //const privateKey = ed.utils.randomPrivateKey();
        const privateKey = walletKeypair.secretKey;
        //console.log("privateKey.toString()",Buffer.from(privateKey).toString('hex'))
        //const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
        const msg = Buffer.from("message hashmessage hash (not message) in ecdsamessage hash (not message) in ecdsamessage hash (not message) in ecdsamessage hash (not message) in ecdsa (not message) in ecdsa").valueOf()
        let message_hash = createKeccakHash('keccak256').update(msg).digest('hex')

        //console.log("message_hash", message_hash)
        message_hash = Buffer.from(message_hash, 'hex')

        const publicKey = new PublicKey(walletKeypair.publicKey.toBase58()).toBytes();

        //console.log("publicKey",Buffer.from(publicKey).toString('hex'))

        const signature = await ed.sign(message_hash, privateKey.slice(0, 32));
        console.log("signature", Buffer.from(signature).toString("hex"))
        console.log("signature", Buffer.from(signature).toString("hex").length)
        console.log("signature", Buffer.from(signature).toJSON().data.length)

        const isValid = await ed.verify(signature, message_hash, publicKey);
        assert.ok(isValid)
    });
})
