const { ipcRenderer } = require('electron')

let selectedTabIds = []

// *** LEAGUES *** //

const leagueSelectElement = document.getElementById('league-select')
ipcRenderer.send('request-leagues')
ipcRenderer.on('recieve-leagues', (event, leagues) => {
  leagues.forEach(league => {
    const leagueOption = document.createElement('option')
    leagueOption.value = league
    leagueOption.text = league
    leagueSelectElement.add(leagueOption)
  })
})

// todo : get selected league
leagueSelectElement.value = ''
leagueSelectElement.onchange = async ({ target: {value} }) => {
    // todo : set selected league
    selectedTabIds = []
    refreshStashTabs()
}

// *** ACCOUNT *** //

const accountInputElement = document.getElementById('account-input')
// todo : get account
accountInputElement.value = ''
accountInputElement.oninput = async ({srcElement: {value}}) => {
  // todo : set account
  refreshStashTabs()
}

// *** SESSION ID *** //

const sessionIdInputElement = document.getElementById('session-id-input')
// todo : get session id
sessionIdInputElement.value = ''
sessionIdInputElement.oninput = async ({srcElement: {value}}) => {
  ipcRenderer.send('set-session-id', sessionIdInputElement.value)
  refreshStashTabs()
}

// *** STASH TABS *** //
const tabsElement = document.getElementById('tabs')

// Request an update to the stash tabs
const refreshStashTabs = async () => {
  const league = leagueSelectElement.value
  const account = accountInputElement.value
  const sessionId = sessionIdInputElement.value
  if(!league || !account || !sessionId) return
  ipcRenderer.send('request-stash-tabs', { league, account, sessionId })
}

// Recieve updates to the stash tabs
ipcRenderer.on('recieve-stash-tabs', (_event, stashTabs) => {
  if(stashTabs.err) {
    tabsElement.innerHTML = `
      <label>Stash tabs to export</label>
      <div class="alert alert-danger">
        <h4 class="alert-heading">Something went wrong 😬</h4>
        <p>${stashTabs.err.message}</p>
      </div>
    `
    return
  }

  const tabsHtml = stashTabs.reduce((acc, stashTab) => {
    const isSelected = selectedTabIds.includes(stashTab.index)
    return acc + `
    <button class="d-flex align-items-center justify-content-left btn btn-${isSelected ? 'success' : 'primary'} btn-block"
    data-id="${stashTab.id}" data-index="${stashTab.index}"
    ${!stashTab.isValid && 'disabled'}
  >
    <div class="stash-color" style="background-color: ${stashTab.color}"></div>
    ${stashTab.name}
  </button>
    `
  }, '')

  tabsElement.innerHTML = `
    <label>Stash tabs to export</label>
    ${tabsHtml}
  `
})

// Select stash tabs
document.getElementById('tabs').onclick = (event) => {
    const element = event.target
    const tabId = parseInt(element.dataset.index)
    if(isNaN(tabId)) return

    // todo : get selected stash ids
    const tabIndex = selectedTabIds.indexOf(tabId)
    if(tabIndex > -1) selectedTabIds.splice(tabIndex, 1)
    else selectedTabIds.push(tabId)

    element.classList.toggle('btn-primary')
    element.classList.toggle('btn-success')
    // todo : set selected stash ids
}

const exportButton = document.getElementById('export-btn')
exportButton.onclick = (event) => {
  const league = leagueSelectElement.value
  const account = accountInputElement.value
  const sessionId = sessionIdInputElement.value
  ipcRenderer.send('request-export', {tabIds: selectedTabIds, account, league, sessionId} )
}

ipcRenderer.on('copied', () => {
  exportButton.classList.remove('btn-primary')
  exportButton.classList.add('btn-success')
  setTimeout(() => {
    exportButton.classList.remove('btn-success')
    exportButton.classList.add('btn-primary')
  }, 5000)
})

refreshStashTabs()