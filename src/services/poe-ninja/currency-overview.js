const axios = require('axios')

const BASE_URL = 'https://poe.ninja/api/data'

const fetchChaosValue = async(apiUrl, cb) => {
    const response = await axios.get(apiUrl)
    const result = response.data
    const _rawItems = result.lines
    let items = {}
    _rawItems.forEach((item) => {
        const itemName = getItemName(item)
        if(cb) {
            items[itemName] = cb(item)
        } else {
            items[itemName] = item.chaosEquivalent || item.chaosValue
        }
    })
    return items
}

const fetchCurrencyOverview = async (league, type) => {
    return await fetchChaosValue(`${BASE_URL}/currencyoverview?league=${league}&type=${type}`)
}

const getCurrency = async (league) => {
    const type = 'Currency'
    return await fetchChaosValue(`${BASE_URL}/currencyoverview?league=${league}&type=${type}`)
}

const getFragment = async (league) => {
    const type = 'Fragment'
    return await fetchChaosValue(`${BASE_URL}/currencyoverview?league=${league}&type=${type}`)
}

const getDivinationCard = async (league) => {
    const type = 'DivinationCard'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`, (item) => {
        const stackSize = item.stackSize || 1
        if(stackSize > 1) return round(item.chaosValue / item.stackSize, 3)
        else return item.chaosValue
    })
}

const getArtifact = async (league) => {
    const type = 'Artifact'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getProphecy = async (league) => {
    const type = 'Prophecy'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getOil = async (league) => {
    const type = 'Oil'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getIncubator = async (league) => {
    const type = 'Incubator'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getDeliriumOrb = async (league) => {
    const type = 'DeliriumOrb'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getInvitation = async (league) => {
    const type = 'Invitation'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getScarab = async (league) => {
    const type = 'Scarab'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getFossil = async (league) => {
    const type = 'Fossil'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getResonator = async (league) => {
    const type = 'Resonator'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getVial = async (league) => {
    const type = 'Vial'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getEssence = async (league) => {
    const type = 'Essence'
    return await fetchChaosValue(`${BASE_URL}/ItemOverview?league=${league}&type=${type}`)
}

const getAllCurrencyValues = async (league) => {
    try {
        let results = await Promise.all([
            getCurrency,
            getFragment,
            getDivinationCard,
            getArtifact,
            getProphecy,
            getOil,
            getIncubator,
            getDeliriumOrb,
            getInvitation,
            getScarab,
            getFossil,
            getResonator,
            getVial,
            getEssence,
        ].map(fn => fn(league)))
        return Object.assign(...results)
    } catch (err) {
        console.log(err.message)
        console.log(err.stack)
    }
    return {}
}

const getItemName = (item) => {
    return item.currencyTypeName || item.name
}

const round = (num, digits) => {
    return Number(Math.round(num + "e" + digits) + "e-" + digits)
}

module.exports = { getAllCurrencyValues }