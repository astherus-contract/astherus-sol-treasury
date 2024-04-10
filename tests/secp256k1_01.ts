import bs58 from "bs58";
import assert from "assert";

const {randomBytes} = require('crypto')
const secp256k1 = require('secp256k1')
const createKeccakHash = require('keccak')
import * as assert from 'assert';
describe("secp256k1_01 test", () => {

    it("secp256k1_01 test", async () => {
        // or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node

// generate message to sign
// message should have 32-byte length, if you have some other length you can hash message
// for example `msg = sha256(rawMessage)`


        let msg = randomBytes(32)
        //console.log(msg.length)

// generate privKey
        let privKey
        do {
            privKey = randomBytes(32)
        } while (!secp256k1.privateKeyVerify(privKey))

// get the public key in a compressed format
        const pubKey = secp256k1.publicKeyCreate(privKey)

// sign the message
        //console.log("privKey.length", privKey.length)
        //console.log("msg.length", msg.length)
        let message_hash = createKeccakHash('keccak256').update("aaaab").digest('hex')
        const textEncoder = new TextEncoder();


        //console.log("message_hash.length", message_hash.length)
        //console.log("message_hash", message_hash)
        //msg=textEncoder.encode(message_hash)
        const msg1 = Buffer.from(message_hash, 'hex')

        //console.log("pubKey", pubKey.length)
        //console.log("privKey", privKey.length)

        //const sigObj = secp256k1.ecdsaSign(msg, privKey)
        const sigObj = secp256k1.ecdsaSign(msg1, privKey)

        //console.log("sigObj", sigObj)

        //console.log("pubKey", pubKey)

        assert.ok(secp256k1.ecdsaVerify(sigObj.signature, msg1, pubKey))

    });


})
