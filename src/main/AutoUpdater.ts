import { app, dialog, shell } from 'electron'
import Path from 'path'
import fs from 'fs'
import axios from 'axios'
import compareVersions from 'compare-versions'
import tmp from 'tmp'
import { spawn } from 'child_process'
const isWin = process.platform === 'win32'
import { version } from '../../package.json'

class AutoUpdater {
  async run() {
    try {
      const data = (
        await axios.get('https://api.github.com/repos/3Speaknetwork/3Speak-app/releases/latest')
      ).data
      if (data.id) {
        const tag_name = data['tag_name']
        if (compareVersions.compare(tag_name, version, '>')) {
          //Update available
          for (const asset of data.assets) {
            if (asset.name.includes('Setup') && asset.name.includes('exe') && isWin) {
              const tmpDir = tmp.dirSync()
              const filePath = Path.join(tmpDir.name, asset.name)
              const file = fs.createWriteStream(filePath)
              const response = await axios({
                method: 'get',
                url: asset.browser_download_url,
                responseType: 'stream',
              })
              await new Promise((resolve, reject) => {
                response.data.pipe(file)
                let error = null
                file.on('error', (err) => {
                  error = err
                  // type error: writer not declared?
                  //     writer.close();
                  reject(err)
                })
                file.on('close', () => {
                  if (!error) {
                    resolve(true)
                  }
                })
              })

              let dialogResponse = dialog.showMessageBoxSync({
                type: 'question',
                buttons: ['Remind me later', 'View release log', 'Update'],
                title: 'Update available',
                message: `New update available version ${tag_name.slice(
                  1,
                )}\nWould you like to update your local 3Speak installation?`,
              })

              if (dialogResponse === 2) {
                spawn(filePath, [], { detached: true })
                app.exit(1)
                break
              } else if (dialogResponse === 1) {
                void shell.openExternal(data.html_url)
              } else {
                break
              }

              dialogResponse = dialog.showMessageBoxSync({
                type: 'question',
                buttons: ['Remind me later', 'Update'],
                title: 'Update available',
                message: `New update available version ${tag_name.slice(
                  1,
                )}\nWould you like to update your local 3Speak installation?`,
              })
              if (dialogResponse === 1) {
                spawn(filePath, [], { detached: true })
                app.exit(1)
              }
              break
            }
          }
        }
      }
    } catch (ex) {
      //Shouldn't be important if request fails... But still should be logged.
      console.error(`Error in autoupdater`, ex.message)
    }
  }
}
export default AutoUpdater
