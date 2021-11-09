const { app, BrowserWindow, ipcMain, clipboard } = require('electron')
const { fetchActiveLeagues } = require('./services/pathofexile/leagues')
const { fetchStashTabs, fetchItemsFromStash } = require('./services/pathofexile/stash')
const { reduceItems, formatExport } = require('./services/export.js')

const DEBUG = process.argv[2] === 'debug'
const DEBUG_OPTIONS = { mode: 'detach' }

let mainWindow

function createMainWindow() {
    const windowOptions = {
        width: 350,
        height: 750,
        x: 100,
        y: 100,
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

ipcMain.on('request-stash-tabs', (event, data) => {
    fetchStashTabs(data.account, data.league, data.sessionId).then((stashTabs) => {
        event.sender.send('recieve-stash-tabs', stashTabs)
    }).catch((err) => {
        event.sender.send('recieve-stash-tabs', { err })
    })
})

ipcMain.on('request-export', (event, data) => {
    const items = fetchItemsFromStash(data.tabIds, data.account, data.league, data.sessionId).then((items) => {
        const reducedItems = reduceItems(items)
        const formattedData = formatExport(reducedItems)
        clipboard.writeText(formattedData)
        event.sender.send('copied')
    })
})