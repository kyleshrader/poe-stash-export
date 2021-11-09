const axios = require('axios')
axios.defaults.withCredentials = true


const BASE_URL = 'https://www.pathofexile.com/character-window/get-stash-items'
const VALID_TAB_TYPES = [ 
    "NormalStash",
    "PremiuemStash",
    "QuadStash",
]

// Retrieve stash tabs
const fetchStashTabs = async (accountName, leagueId, sessionId) => {
    // `POESESSID=${sessionId}; Expires=null; Domain=pathofexile.com; Path=/; Secure; HttpOnly; SameSite=Lax`
    const apiUrl = `${BASE_URL}?accountName=${accountName}&league=${leagueId}&tabs=1`
    const response = await axios.get(apiUrl, getRequestOptions(sessionId))
    let tabs = response.data.tabs
    tabs = tabs.map(tab => ({
        id: tab.id,
        index: tab.i,
        name: tab.n,
        color: `rgb(${tab.colour.r}, ${tab.colour.g}, ${tab.colour.b})`,
        isValid: true, //VALID_TAB_TYPES.includes(tab.type),
    }))
    return tabs
}

// Retrieve stash items
const fetchItemsFromStash = async (stashTabs, accountName, leagueId, sessionId) => {
    if(!stashTabs) return []
    let itemsFromStash = []
    for(let i = 0; i < stashTabs.length; i++) {
        const itemsFromTab = await fetchItemsFromTab(stashTabs[i], accountName, leagueId, sessionId)
        itemsFromStash.push(...itemsFromTab)
    }
    return itemsFromStash
}

const fetchItemsFromTab = async (stashTab, accountName, leagueId, sessionId) => {
    const apiUrl = `${BASE_URL}?accountName=${accountName}&league=${leagueId}&tabIndex=${stashTab}`
    const response = await axios.get(apiUrl, getRequestOptions(sessionId))
    const {items: rawItems} = response.data
    return rawItems.map(rawItem => ({
        itemName: rawItem.name,
        itemBaseType: rawItem.baseType,
        itemTypeLine: rawItem.typeLine,
        itemLevel: rawItem.ilvl,
        equipmentType: getEquipmentType(rawItem),
        quantity: rawItem.stackSize || 1,
        //itemType: getItemType(rawItem),
        identified: rawItem.identified,
        rarity: getItemRarity(rawItem),
        _rawTab: response.data,
        _rawItem: rawItem,
    }))
}

const getEquipmentType = ({icon}) => {
    icon = atob(icon.split('/')[5])

    if (/\/BodyArmours\//.test(icon)) return 'bodyArmour'
    if (/\/Helmets\//.test(icon)) return 'helmet'
    if (/\/Gloves\//.test(icon)) return 'glove'
    if (/\/Boots\//.test(icon)) return 'boot'
    if (/\/Belts\//.test(icon)) return 'belt'
    if (/\/Amulets\//.test(icon)) return 'amulet'
    if (/\/Rings\//.test(icon)) return 'ring'
    if (/\/OneHandWeapons\//.test(icon)) return 'oneHand'
    if (/\/TwoHandWeapons\//.test(icon)) return 'twoHand'

    return null
}

// Item rarity is based upon the frame type
const getItemRarity = ({frameType}) => {
    if (frameType === 0) return 'normal'
    if (frameType === 1) return 'magic'
    if (frameType === 2) return 'rare'
    if (frameType === 3) return 'unique'
    
    return null
}

const getItemType = (item) => {
    if(item.icon) {
        const icon = JSON.parse(atob(item.icon.split('/')[5]))
        if (icon[2].f) {
            const path = icon[2].f.split('/')
            const type = path[path.length-1]
            return type;
        }
    }
    
    return null
}

const getRequestOptions = (sessionId) => {
    return {
        headers: {
            'User-Agent': 'stash-export, kyle.r.shrader@gmail.com',
            Cookie: `POESESSID=${sessionId}; Expires=null; Domain=pathofexile.com; Path=/; Secure; HttpOnly; SameSite=Lax`
        }
    }
}

module.exports = { fetchItemsFromTab, fetchItemsFromStash, fetchStashTabs}