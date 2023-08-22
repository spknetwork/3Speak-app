import os from 'os';
import Path from 'path';
import fs from 'fs';
import axios from 'axios';
import compareVersions from 'compare-versions';
import { EventEmitter } from 'events';

const isWin = process.platform === 'win32';

class PoAInstaller extends EventEmitter {
  async main() {
    try {
      await this.install();
    } catch (error) {
      console.error(error);
      this.emit('error', error);
      process.exit(1);
    }
  }

  async getCurrentVersion(installDir) {
    const versionFilePath = Path.join(installDir, 'version.txt');
    try {
      const currentVersion = await fs.promises.readFile(versionFilePath, 'utf-8');
      return currentVersion.trim();
    } catch (error) {
      return '0.0.0';
    }
  }

  async getDefaultPath() {
    let defaultPath;
    switch (process.platform) {
      case 'win32':
        defaultPath = Path.join('AppData/Roaming/Microsoft/Windows/Start Menu/Programs/PoA');
        return defaultPath;
      case 'darwin':
        defaultPath = Path.join(os.homedir(), 'Applications/PoA/poa');
        break;
      case 'linux':
        defaultPath = Path.join(os.homedir(), 'bin/PoA/poa');
        break;
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    try {
      await fs.promises.access(defaultPath, fs.constants.F_OK);
      return defaultPath;
    } catch (error) {
      return null;
    }
  }

  async install() {
    const installDir = Path.join(os.homedir(), (await this.getDefaultPath()) || '');
    console.log(`Installing PoA to ${installDir}`);

    // Create the data/badger directory if it doesn't exist
    const dataDir = Path.join('.', 'data', 'badger');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`Directory ${dataDir} created.`);
    }

    // ... (rest of your existing code)
    const { data } = await axios.get('https://api.github.com/repos/spknetwork/proofofaccess/releases/latest');
    const { tag_name, assets } = data;

    const currentVersion = await this.getCurrentVersion(installDir);
    if (compareVersions.compare(tag_name, currentVersion, '>')) {
      this.emit('update-available', tag_name);

      let asset;
      if (isWin) {
        asset = assets.find((a) => a.name.includes('win-main') && a.name.includes('exe'));
      } else if (process.platform === 'linux') {
        asset = assets.find((a) => a.name.includes('linux-main'));
      } else if (process.platform === 'darwin') {
        asset = assets.find((a) => a.name.includes('mac-main'));
      }

      if (!asset) {
        console.error('Could not find PoA asset for this platform');
        return;
      }

      const response = await axios({
        method: 'get',
        url: asset.browser_download_url,
        responseType: 'arraybuffer',
      });

      const installPath = isWin ? Path.join(installDir, 'PoA.exe') : Path.join(installDir, 'PoA');
      fs.writeFileSync(installPath, Buffer.from(response.data));

      // Make the file executable (only for non-Windows)
      if (!isWin) {
        fs.chmodSync(installPath, 0o755);
      }

      console.log(`PoA installed at: ${installPath}`);
      this.emit('installed', installPath);

      const versionFilePath = Path.join(installDir, 'version.txt');
      fs.writeFileSync(versionFilePath, tag_name);
      console.log(`Version ${tag_name} saved to ${versionFilePath}`);
      this.emit('version-updated', tag_name);
    } else {
      console.log('PoA is already up-to-date');
      this.emit('up-to-date');
    }
  }
}

export default PoAInstaller;
