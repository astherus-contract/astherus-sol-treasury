import {secp256k1} from '@noble/curves/secp256k1';
import * as anchor from "@coral-xyz/anchor";

const secp256k1_0 = require('secp256k1')
const createKeccakHash = require('keccak')
import * as assert from 'assert';


describe("secp256k1_02 test", () => {

    it("secp256k1_02 test", async () => {
        const walletKeypair = anchor.web3.Keypair.generate();

        const priv = walletKeypair.secretKey.slice(0, 32);
        const pub = secp256k1.getPublicKey(walletKeypair.secretKey.slice(0, 32));
        //const pub = walletKeypair.publicKey.toBytes()

        const msg = Buffer.from("message hashmessage hash (not message) in ecdsamessage hash (not message) in ecdsamessage hash (not message) in ecdsamessage hash (not message) in ecdsa (not message) in ecdsa").valueOf()
        //console.log("msg", msg.length)

        let message_hash = createKeccakHash('keccak256').update(msg).digest('hex')
        //console.log("message_hash", message_hash)
        message_hash = Buffer.from(message_hash, 'hex')

        const sig = secp256k1.sign(message_hash, priv); // `{prehash: true}` option is available
        //console.log("sig",sig)
        const isValid = secp256k1.verify(sig, message_hash, pub) === true;

        //console.log("isValid", isValid)

        const sigObj = secp256k1_0.ecdsaSign(message_hash, priv)
        //console.log("sigObj", Buffer.from(sigObj.signature).toString('hex'))
        //console.log(pub)
        assert.ok(secp256k1_0.ecdsaRecover(sigObj.signature, sigObj.recid, message_hash, true, pub))
        //console.log(pub)
        //console.log("testttt", sig.toCompactHex())

    });


})
