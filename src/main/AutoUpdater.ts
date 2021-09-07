import { app, dialog, shell } from "electron";
import Path from "path";
import fs from "fs";
import axios from 'axios';
import compareVersions from 'compare-versions';
import tmp from 'tmp';
import { spawn } from 'child_process'
const isWin = process.platform === 'win32'
var version = require('../../package.json').version;

class AutoUpdater {
    async run() {
        try {
            var data = (await axios.get("https://api.github.com/repos/vaultec81/3Speak-app/releases/latest")).data;
            if (data.id) {
                var tag_name = data["tag_name"];
                if (compareVersions.compare(tag_name, version, '>')) {
                    //Update available
                    for (var asset of data.assets) {
                        if (asset.name.includes("Setup") && asset.name.includes("exe") && isWin) {
                            var tmpDir = tmp.dirSync()
                            var filePath = Path.join(tmpDir.name, asset.name);
                            const file = fs.createWriteStream(filePath);
                            var response = await axios({
                                method: 'get',
                                url: asset.browser_download_url,
                                responseType: 'stream',
                            })
                            await new Promise((resolve, reject) => {
                                response.data.pipe(file);
                                let error = null;
                                file.on('error', err => {
                                    error = err;
				    // type error: writer not declared?
                               	    //     writer.close();
                                    reject(err);
                                });
                                file.on('close', () => {
                                    if (!error) {
                                        resolve(true);
                                    } 
                                });
                            })
                            var dialogResponse = dialog.showMessageBoxSync({
                                type: "question", 
                                buttons: [
                                    "Remind me later",
                                    "View release log",
                                    "Update"
                                ],
                                title: "Update available",
                                message: `New update available version ${tag_name.slice(1)}\nWould you like to update your local 3Speak installation?`
                            })
                            if(dialogResponse === 2) {
                                spawn(filePath, [], {detached: true});
                                app.exit(1);
                                break;
                            } else if(dialogResponse === 1) {
                                shell.openExternal(data.html_url)
                            } else {
                                break;
                            }
                            var dialogResponse = dialog.showMessageBoxSync({
                                type: "question", 
                                buttons: [
                                    "Remind me later",
                                    "Update"
                                ],
                                title: "Update available",
                                message: `New update available version ${tag_name.slice(1)}\nWould you like to update your local 3Speak installation?`
                            })
                            if(dialogResponse === 1) {
                                spawn(filePath, [], {detached: true});
                                app.exit(1);
                            }
                            break;
                        }
                    }
                }
            }
        } catch (ex) {
            //Shouldn't be important if request fails... But still should be logged.
            console.log(ex);
        }
    }
}
export default AutoUpdater;