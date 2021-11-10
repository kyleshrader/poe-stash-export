// https://poe.ninja/api/data/currencyoverview?league=Scourge&type=Currency
// const currencies = _.lines[]
// const item = { name: currencies.currencyTypeName, value: currencies.chaosEquivalent }

const axios = require('axios')

const BASE_URL = 'https://poe.ninja'

const fetchCurrencyOverview = async (league, type) => {
    const apiUrl = `${BASE_URL}/api/data/currencyoverview?league=${league}&type=${type}`
    const response = await axios.get(apiUrl)
    const result = response.data
    const _rawItems = result.lines
    let items = {}
    _rawItems.forEach((item) => {
        items[item.currencyTypeName] = item.chaosEquivalent
    })
    return items
}

const getCurrency = async (league) => {
    return await fetchCurrencyOverview(league, 'Currency')
}

const getFragment = async (league) => {
    return await fetchCurrencyOverview(league, 'Fragment')
}

const getAllCurrencyValues = async (league) => {
    const currency = await getCurrency(league)
    const fragment = await getFragment(league)
    return Object.assign(currency, fragment)
}

module.exports = { getAllCurrencyValues }