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
      // If the file doesn't exist or there is an error reading it, return a default version
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

    // Check if the default path exists
    try {
      await fs.promises.access(defaultPath, fs.constants.F_OK);
      return defaultPath;
    } catch (error) {
      // Default path does not exist, return null
      return null;
    }
  }
  async install() {
    const installDir = Path.join(os.homedir(), (await this.getDefaultPath()) || '');
    console.log(`Installing PoA to ${installDir}`);
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }

    console.log('Installing PoA...');

    const { data } = await axios.get('https://api.github.com/repos/spknetwork/proofofaccess/releases/latest');
    const { tag_name, assets } = data;

    console.log(tag_name);
    const currentVersion = await this.getCurrentVersion(installDir);
    if (compareVersions.compare(tag_name, currentVersion, '>')) {
      console.log('Update available');
      this.emit('update-available', tag_name);

      let asset;

      if (isWin) {
        asset = assets.find((a) => a.name.includes('win-main') && a.name.includes('exe'));
      } else if (process.platform === 'linux') {
        asset = assets.find((a) => a.name.includes('linux-main')); // Modified this line
      } else if (process.platform === 'darwin') {
        asset = assets.find((a) => a.name.includes('mac-main') && a.name.includes('dmg'));
      }

      if (!asset) {
        console.error('Could not find PoA asset for this platform');
        return;
      }

      console.log(`Downloading PoA for ${process.platform}...`);

      const response = await axios({
        method: 'get',
        url: asset.browser_download_url,
        responseType: 'arraybuffer',
      });

      const installPath = isWin ? Path.join(installDir, 'PoA.exe') : Path.join(installDir, 'PoA');

      fs.writeFileSync(installPath, Buffer.from(response.data));

      console.log(`PoA installed at: ${installPath}`);
      this.emit('installed', installPath);

      // Update version.txt file
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