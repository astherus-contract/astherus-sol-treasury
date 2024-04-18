const createKeccakHash = require('keccak')
import * as assert from 'assert';


/**
 * https://www.npmjs.com/package/@noble/ed25519/v/1.7.1
 */
describe("keccak256 fake test", () => {

    it("keccak256 fake test", async () => {
        const msg1 = Buffer.concat([
            Buffer.from("1713369980"),
            Buffer.from("1713371180"),
            Buffer.from("10000000"),
        ])
        let messageHash1 = createKeccakHash('keccak256').update(msg1).digest('hex')

        //console.log("messageHash1", messageHash1)


        const msg2 = Buffer.concat([
            Buffer.from("17133699"),
            Buffer.from("8017133711"),
            Buffer.from("8010000000"),
        ])
        let messageHash2 = createKeccakHash('keccak256').update(msg1).digest('hex')

        //console.log("messageHash2", messageHash2)

        assert.equal(messageHash1, messageHash2)

    });
})
