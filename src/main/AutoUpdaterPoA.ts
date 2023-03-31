import os from 'os';
import Path from 'path';
import fs from 'fs';
import axios from 'axios';
import compareVersions from 'compare-versions';
import { spawn } from 'child_process';

const isWin = process.platform === 'win32';

class PoAInstaller {
  async main() {
    try {
      await PoAInstaller.install();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  static async getCurrentVersion(installDir) {
    const versionFilePath = Path.join(installDir, 'version.txt');
    try {
      const currentVersion = await fs.promises.readFile(versionFilePath, 'utf-8');
      return currentVersion.trim();
    } catch (error) {
      // If the file doesn't exist or there is an error reading it, return a default version
      return '0.0.0';
    }
  }


  static async getDefaultPath() {
    let defaultPath;
    switch (process.platform) {
      case 'win32':
        defaultPath = Path.join('AppData/Roaming/Microsoft/Windows/Start Menu/Programs/PoA');
        console.log('Default path: ', defaultPath);
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



  static async install() {
    const installDir = Path.join(os.homedir(), (await PoAInstaller.getDefaultPath()) || '');

    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }

    console.log('Installing PoA...');

    const { data } = await axios.get('https://api.github.com/repos/nathansenn/proofofaccess/releases/latest');
    const { tag_name, assets } = data;

    console.log(tag_name);
    const currentVersion = await PoAInstaller.getCurrentVersion(installDir);
    if (compareVersions.compare(tag_name, currentVersion, '>')) {
      console.log('Update available');
      const asset = assets.find((a) => a.name.includes('win-main') && a.name.includes('exe') && isWin);

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

      const installPath = Path.join(installDir, 'PoA.exe');

      fs.writeFileSync(installPath, Buffer.from(response.data));

      console.log(`PoA installed at: ${installPath}`);

      // Update version.txt file
      const versionFilePath = Path.join(installDir, 'version.txt');
      fs.writeFileSync(versionFilePath, tag_name);
      console.log(`Version ${tag_name} saved to ${versionFilePath}`);
    } else {
      console.log('PoA is already up-to-date');
    }
  }
}

export default PoAInstaller;
