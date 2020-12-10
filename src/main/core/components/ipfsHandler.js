//import ipfsPath from 'go-ipfs'
import Path from 'path'
import os from 'os'
import fs from 'fs'
import IpfsClient from 'ipfs-http-client'
import { execFile, spawn } from 'child_process'
import execa from 'execa'
const waIpfs = require('wa-go-ipfs')
const toUri = require('multiaddr-to-uri')

var defaultIpfsConfig = {
    "Gateway": {
        "HTTPHeaders": {
            "Access-Control-Allow-Credentials": [
                "true"
            ],
            "Access-Control-Allow-Headers": [
                "Authorization"
            ],
            "Access-Control-Allow-Origin": [
                "*"
            ],
            "Access-Control-Expose-Headers": [
                "Location"
            ],
            "HTTPHeaders.Access-Control-Allow-Methods": [
                "PUT",
                "POST",
                "GET"
            ]
        }
    },
    "Bootstrap": [
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
        "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
        "/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
        "/ip4/209.222.98.165/tcp/4001/p2p/12D3KooWAH9FypmaduofuBTtubSHVJghxW35aykce23vDHjfhiAd"
    ]
}
class ipfsHandler {
    static get ready() {
        return new Promise(async(resolve, reject) => {
            var ipfsInfo = await ipfsHandler.getIpfs();
            if (ipfsInfo.ipfs) {
                return resolve(ipfsInfo.ipfs)
            } else {
                ipfsHandler.events.once("ready", async () => {
                    ipfsInfo = await ipfsHandler.getIpfs();
                    return resolve(ipfsInfo.ipfs)
                })
            }
        })
    }
    static async start(appPath) {
        var ipfsInfo = await ipfsHandler.getIpfs();
        if (!ipfsInfo.exists) {
            ipfsInfo = await ipfsHandler.getIpfs();
            await ipfsHandler.init(ipfsInfo.ipfsPath);
            fs.writeFileSync(Path.join(appPath, "ipfs.pid"), await ipfsHandler.run());
            ipfsHandler.events.emit("ready")
        } else {
            if (ipfsInfo.ipfs) {
                ipfsHandler.events.emit("ready")
            } else {
                fs.writeFileSync(Path.join(appPath, "ipfs.pid"), await ipfsHandler.run());
                ipfsHandler.events.emit("ready")
            }
            //let config = JSON.parse(fs.readFileSync(Path.join(pinzaInfo.pinzaPath, "config")).toString())
            //if (config.ipfs.autoStart === true) {
            //}
        }
    }
    static async stop(appPath) {
        try {
            process.kill(Number(fs.readFileSync(Path.join(appPath, "ipfs.pid"))))
            fs.unlinkSync(Path.join(appPath, "ipfs.pid"))
        } catch {

        }
    }
    static async init(repoPath) {
        var goIpfsPath = await waIpfs.getPath(waIpfs.getDefaultPath({ dev: process.env.NODE_ENV === 'development' }))
        await execa(goIpfsPath, ['init'], {
            env: {
                IPFS_Path: repoPath
            }
        })
        for (var key in defaultIpfsConfig) {
            var subTree = defaultIpfsConfig[key];
            await execa(goIpfsPath, ["config", "--json", key, JSON.stringify(subTree)], {
                env: {
                    IPFS_Path: repoPath
                }
            })
        }
    }
    static run(repoPath) {
        return new Promise(async (resolve, reject) => {
            try {
                var goIpfsPath = await waIpfs.getPath(waIpfs.getDefaultPath({ dev: process.env.NODE_ENV === 'development' }))
                var subprocess = execa(goIpfsPath, ['daemon', '--enable-pubsub-experiment', '--enable-gc'], {
                    env: {
                        IPFS_Path: repoPath
                    }
                })
                subprocess.stderr.on('data', data => console.error(data.toString()))
                subprocess.stdout.on('data', data => console.log(data.toString()))
                let output = '';
                const readyHandler = data => {
                    output += data.toString()
                    if (output.match(/(?:daemon is running|Daemon is ready)/)) {
                        // we're good
                        subprocess.stdout.off('data', readyHandler)
                        resolve(subprocess.pid)
                    }
                }
                subprocess.stdout.on('data', readyHandler)
            } catch (ex) {
                reject(ex);
            }
        })
    }
    static async getIpfs() {
        const AppPath = Path.join(os.homedir(), ".blasio-app")

        let ipfsPath;
        if (process.env.IPFS_Path) {
            ipfsPath = process.env.IPFS_Path;
        } else {
            ipfsPath = Path.join(os.homedir(), ".ipfs");
        }

        let exists;
        let apiAddr;
        let isLocked;
        let ipfs;
        let gateway;
        if (fs.existsSync(ipfsPath)) {
            exists = true;
            if (fs.existsSync(Path.join(ipfsPath, "api"))) {
                apiAddr = fs.readFileSync(Path.join(ipfsPath, "api")).toString()
            }
            if (fs.existsSync(Path.join(ipfsPath, "repo.lock"))) {
                isLocked = true;
            } else {
                isLocked = false;
            }
        } else {
            exists = false;
            /*if (fs.existsSync(Path.join(pinzaPath, "config"))) {
                var appConfig = JSON.parse(fs.readFileSync(Path.join(AppPath, "config")).toString())
                apiAddr = appConfig.ipfs.apiAddr;
            }*/
        }

        if (apiAddr) {
            ipfs = new IpfsClient(apiAddr);
            try {
                await ipfs.config.get("Addresses");
            } catch (ex) {
                console.log(ex)
                ipfs = null;
            }
        }

        if (ipfs !== null && ipfs) {
            var gma = await ipfs.config.get("Addresses.Gateway");
            gateway = toUri(gma) + "/ipfs/";
        } else {
            gateway = "http://localhost:8080/ipfs/";
        }

        return {
            isLocked,
            exists,
            ipfsPath,
            ipfs,
            apiAddr,
            gateway
        }
    }
}
ipfsHandler.events = new (require('events'))()
export default ipfsHandler;