import Core from '../src/main/core';
const tmp = require('tmp');
const assert = require('assert')
/**
 * @type {Core}
 */
let client;
describe("Blocklist", function () {
    this.beforeAll(async() => {
        //
        var testDir = tmp.dirSync().name;
        client = new Core({
            path: testDir
        })
        await client.start()
        //populate
        await client.blocklist.add("hive:username:blockedpost1");
        await client.blocklist.add("hive:blockeduser");
    })
    it("Check blocked post", async() => {
        assert.strictEqual(await client.blocklist.has("hive:username:blockedpost1"), true)
    })
    it("Checked unblocked post", async() => {
        assert.strictEqual(await client.blocklist.has("hive:username:unblockedpost1"), false);
    })
    it("Checked blocked author", async() => {
        assert.strictEqual(await client.blocklist.has("hive:blockeduser:post1"), true);
    })
    it("Checked unblocked author", async() => {
        assert.strictEqual(await client.blocklist.has("hive:username:post1"), false);
    })
    this.afterAll(async() => {
        await client.stop();
    })
})