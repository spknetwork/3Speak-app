import ipfsPath from 'go-ipfs'
import Path from 'path'
import os from 'os'
import fs from 'fs'
import IpfsClient from 'ipfs-http-client'
import { exec, spawn } from 'child_process'
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
    }
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
            ipfsInfo = await utils.ipfs.getIpfs();
            await utils.ipfs.init(ipfsInfo.ipfsPath);
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
    static init(repoPath) {
        var goIpfsPath = ipfsPath.path();
        return new Promise((resolve, reject) => {
            exec(`${goIpfsPath} init`, {
                env: {
                    IPFS_Path: repoPath
                }
            }, () => {
                //console.log(`${goIpfsPath} config --json API ${JSON.stringify(JSON.stringify(defaultIpfsConfigs))}`)
                exec(`${goIpfsPath} config --json API ${JSON.stringify(JSON.stringify(defaultIpfsConfig))}`, {
                    env: {
                        IPFS_Path: repoPath
                    }
                }, () => {
                    resolve()
                })
            });
        })
    }
    static run(repoPath) {
        var goIpfsPath = ipfsPath.path();
        var ipfsDaemon = spawn(goIpfsPath, [
            "daemon",
            "--enable-pubsub-experiment",
            "--enable-gc"
        ], {
            env: {
                IPFS_Path: repoPath
            },
            detached: true
        });
        return ipfsDaemon.pid;
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

        if (ipfs) {
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