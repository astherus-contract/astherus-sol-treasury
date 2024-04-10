import * as assert from 'assert';

describe("claim_per_hours test", () => {

    it("claim_per_hours test", async () => {
        console.log("秒-----")
        console.log(Date.now()/1000)
        console.log(Date.now()/1000 / (60 * 60))
        console.log((Date.now()/1000 + 60 * 5) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 10) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 15) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 20) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 25) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 30) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 35) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 40) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 45) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 50) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 55) / (60 * 60))
        console.log((Date.now()/1000 + 60 * 60) / (60 * 60))

        console.log("毫秒-----")
        console.log(Date.now() / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 5) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 10) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 15) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 20) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 25) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 30) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 35) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 40) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 45) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 50) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 55) / (60 * 60 * 1000))
        console.log((Date.now() + 1000 * 60 * 60) / (60 * 60 * 1000))
    });
})
