import Core from '../src/main/core';
const tmp = require('tmp');
const assert = require('assert')
/**
 * @type {Core}
 */
let client;
describe("Main", function () {
    this.timeout(300000);
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
    describe("DistillerDB", function () {
        afterEach(async() => {
            await client.distillerDB.pouch.compact();
        })
        it("Fetch content", async () => {
            //console.log(client.distillerDB)
            await client.distillerDB.getContent("hive:evagavilan:una-que-otra-bicicleta-una-foto-cada-dia-183-366")
        });
        it("Fetch content cached", async () => {
            //console.log(client.distillerDB)
            await client.distillerDB.getContent("hive:evagavilan:una-que-otra-bicicleta-una-foto-cada-dia-183-366")
        });
        it("Fetch tags", async () => {
            //console.log(client.distillerDB)
            await client.distillerDB.getTag("3speak")
        });
        it("Fetch tags cached", async () => {
            //console.log(client.distillerDB)
            await client.distillerDB.getTag("3speak")
        });
        it("Fetch children initial", async () => {
            await client.distillerDB.getChildren("hive:evagavilan:hnrhelpe")
        })
        it("Fetch children cached", async () => {
            await client.distillerDB.getChildren("hive:evagavilan:hnrhelpe");
        })
        it("Fetch account", async () => {
            await client.distillerDB.getAccount("hive:evagavilan");
        })
        it("Fetch account cached", async () => {
            await client.distillerDB.getAccount("hive:evagavilan");    
        })
        it("Fetch posts", async () => {
            await client.distillerDB.getPosts("hive:evagavilan");
        })
        it("Fetch posts cached", async () => {
            await client.distillerDB.getPosts("hive:evagavilan");
        })
    })
    describe("Blocklist", function () {
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
    })
    this.afterAll(async() => {
        await client.stop();
    })
})