const reduceItems = (items) => {
    let result = {}
    items.forEach(item => {
        const key = getName(item)
        if(Object.keys(result).includes(key))
            result[key].quantity += item.quantity
        else result[key] = item
    })
    return result
}

const formatExport = (items) => {
    let result = 'Name\tQuantity\tValue Per\tValue\n'
    const keys = Object.keys(items)
    for(let i = 0; i < keys.length; i++) {
        const item = items[keys[i]]
        const name = keys[i]
        const quantity = item.quantity
        result += `${name}\t${quantity}\t\t=B:B*C:C\n`
    }
    result += `\n\nTotal Value\t=SUM(D:D)`
    return result
}

const getName = (item) => {
    if(item.itemName !== '') return item.itemName
    if(item.itemTypeLine !== '') return item.itemTypeLine
    if(item.itemBaseType !== '') return item.itemBaseType
    return ''
}

module.exports = {reduceItems, formatExport}