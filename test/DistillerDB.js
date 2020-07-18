const Core = require('../src/main/core')
const tmp = require('tmp')
/**
 * @type {Core}
 */
let client;

/**
 * @todo Implement strict checking for data types.
 */
describe("DistillerDB", function () {
    this.timeout(5000); 
    before(async() => {
        var testDir = tmp.dirSync().name;
        client = new Core({
            path: testDir
        })
        await client.start()
    });
    afterEach(async() => {
        await client.distillerDB.pouch.compact();
    })
    it("Fetch content", async () => {
        //console.log(client.distillerDB)
        await client.distillerDB.getContent("hive/evagavilan/una-que-otra-bicicleta-una-foto-cada-dia-183-366")
    });
    it("Fetch content cached", async () => {
        //console.log(client.distillerDB)
        await client.distillerDB.getContent("hive/evagavilan/una-que-otra-bicicleta-una-foto-cada-dia-183-366")
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
        await client.distillerDB.getChildren("hive/evagavilan/hnrhelpe")
    })
    it("Fetch children cached", async () => {
        await client.distillerDB.getChildren("hive/evagavilan/hnrhelpe");
    })
    it("Fetch account", async () => {
        await client.distillerDB.getAccount("hive/evagavilan");
    })
    it("Fetch account cached", async () => {
        await client.distillerDB.getAccount("hive/evagavilan");    
    })
    it("Fetch posts", async () => {
        await client.distillerDB.getPosts("hive/evagavilan");
    })
    it("Fetch posts cached", async () => {
        await client.distillerDB.getPosts("hive/evagavilan");
    })
})