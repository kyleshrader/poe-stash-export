const { app, BrowserWindow, ipcMain, clipboard } = require('electron')
const Store = require('electron-store')
const { fetchActiveLeagues } = require('./services/pathofexile/leagues')
const { fetchStashTabs, fetchItemsFromStash } = require('./services/pathofexile/stash')
const { reduceItems, priceItems, formatExport } = require('./services/export.js')

const DEBUG = process.argv[2] === 'debug'
const DEBUG_OPTIONS = { mode: 'detach' }

let mainWindow

const store = new Store({
    name: 'poe-stash-export',
    defaults: {
        window: {
            width: 350,
            height: 750,
            x: 100,
            y: 100,
        },
        user: {
            accountName: '',
            sessionId: '',
        },
        selectedLeague: 'Standard',
    }
})

function createMainWindow() {
    const windowSettings = store.get('window')
    const windowOptions = {
        width: store.get('window.width') || 350,
        height: store.get('window.height') || 750,
        x: store.get('window.x') || 100,
        y: store.get('window.y') || 100,
        modal: true,
        alwaysOntop: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        minimizable: true,
    }

    let window = new BrowserWindow(windowOptions)

    window.loadFile('./src/gui/main.html')
    window.setMenu(null)
    if (DEBUG) window.webContents.openDevTools(DEBUG_OPTIONS);

    

    window.on('resized', () => {
        const size = window.getSize()
        store.set('window.width', size[0])
        store.set('window.height', size[1])
        const pos = window.getPosition()
        store.set('window.x', pos[0])
        store.set('window.y', pos[1])
    })

    window.on('moved', () => {
        const pos = window.getPosition()
        store.set('window.x', pos[0])
        store.set('window.y', pos[1])
    })

    return window
}

app.on('ready', () => {
    mainWindow = createMainWindow()

    mainWindow.on('closed', () => {
        mainWindow = null
    })
})

app.on('window-all-closed', app.quit)

// todo : ipcMain.on('action', cb)

// ipcMain.on('set-session-id', (_event, sessionId) => {
// })

ipcMain.on('request-leagues', (event) => {
    fetchActiveLeagues().then((leagues) => {
        event.sender.send('recieve-leagues', leagues)
    })
})

let useGuildStash = false;
ipcMain.on('set-guild-option', (event, value) => {
    useGuildStash = value
    event.sender.send('updated-guild-option')
})

ipcMain.on('request-stash-tabs', (event, data) => {
    fetchStashTabs(data.account, data.league, data.sessionId, useGuildStash).then((stashTabs) => {
        event.sender.send('recieve-stash-tabs', stashTabs)
    }).catch((err) => {
        event.sender.send('recieve-stash-tabs', { err })
    })
})

ipcMain.on('request-export', (event, data) => {
    if(data.tabIds.length == 0) return
    const items = fetchItemsFromStash(data.tabIds, data.account, data.league, data.sessionId, useGuildStash).then((items) => {
        const reducedItems = reduceItems(items)
        priceItems(reducedItems, data.league).then((items) => {
            const formattedData = formatExport(items)
            clipboard.writeText(formattedData)
            event.sender.send('copied')
        })
    })
})

ipcMain.on('get-config', (event, key) => {
    event.sender.send('receive-config', { key, value: store.get(key) })
})

ipcMain.on('set-config', (event, key, value) => {
    store.set(key, value)
})