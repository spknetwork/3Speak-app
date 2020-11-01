var hivejs = require("@hiveio/hive-js");
const axios = require("axios")


const getAccountStatus = async (username) => {
   const monetizerAccountStatus = await axios.post(`https://native-ads.imwatsi.com`, {
        "jsonrpc": "2.0",
        "method": "monetizer.get_account",
        "params": {"name": username},
        "id": 1
    })

    const advertizerAccountStatus = await axios.post(`https://native-ads.imwatsi.com`, {
        "jsonrpc": "2.0",
        "method": "advertizer.get_account",
        "params": {"name": username},
        "id": 1
    })

    const monetizerResult = monetizerAccountStatus.data.result

    const advertizerResult = advertizerAccountStatus.data.result

    const status = {
        advertizerResult, monetizerResult
    }

    return status
}

const createMonetizerAccount = async (username, active) => {
    const createMonetizer = await hivejs.broadcast.customJsonAsync(active, [], [username], "native-ads", JSON.stringify([
        "monetizer",
        "account_init",
        {}
    ]));

    return createMonetizer
}

const createAdvertizerAccount = async (username, active) => {
    const createAdvertizer = await hivejs.broadcast.customJsonAsync(active, [], [username], "native-ads", JSON.stringify([
        "advertizer",
        "account_init",
        {
            "profile": {}
        }
    ]));

    return createAdvertizer
}

const createAdSpace = async (spaceData) => {
    //console.log(spaceData)
    const createAdSpace = await hivejs.broadcast.customJsonAsync(spaceData.wif, [], [spaceData.username], "native-ads", JSON.stringify([
        "monetizer",
        "create_space",
        {
            "space_name": spaceData.spaceName,
            "ad_type": spaceData.ad_type,
            "title": spaceData.spaceTitle,
            "description": spaceData.spaceChar,
            "guidelines": spaceData.spaceGuide
        }
    ]));

    return createAdSpace
}

const getAdSpaceList = async (username) => {
    const monetizerAdSpaces = await axios.post(`https://native-ads.imwatsi.com`, {
        "jsonrpc": "2.0",
        "method": "monetizer.get_spaces",
        "params": {"name": username},
        "id": 1
    })

    return monetizerAdSpaces
}

export default {
    getAccountStatus,
    createMonetizerAccount,
    createAdvertizerAccount,
    createAdSpace,
    getAdSpaceList
}