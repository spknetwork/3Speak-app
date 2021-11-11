# 3Speak-App
[![Node.js CI](https://github.com/3speaknetwork/3Speak-app/actions/workflows/nodejs_ci.yml/badge.svg)](https://github.com/3speaknetwork/3Speak-app/actions/workflows/nodejs_ci.yml)

The 3Speak decentralized desktop app.

![3Speak Preview](https://raw.githubusercontent.com/3speaknetwork/3Speak-app/master/media/media1.PNG)

## Usage guide

For normal users you will want to go to [Releases](https://github.com/3speaknetwork/3Speak-app/releases) where you can find the latest release for your operating system.

## Developer Setup

First, you should clone this repo to your computer via git like this: 

```bash
git clone https://github.com/3speaknetwork/3Speak-app
```

Then, install npm dependancies:

```bash
cd 3Speak-app
npm install --legacy-peer-deps --python=python2.7
```

After installing dependancies, you can run the following command to start app in `dev` mode:

```bash
npm run dev
```

If you want to build a production binary:

```bash
npm run package
```

If you want to run in production mode:

```bash
npm run prod
```

# License
GPLv3
