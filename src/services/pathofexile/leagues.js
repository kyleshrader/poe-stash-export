const axios = require('axios')

const API_URL = 'https://api.pathofexile.com/leagues'
const FALLBACK_LEAGUE = 'Standard'

module.exports.fetchActiveLeagues = async () => {
    let leagueIds = []
    const response = await axios.get(API_URL, {
        headers: {
            'User-Agent': 'stash-export, kyle.r.shrader@gmail.com'
        }
    })
    const leagues = response.data
    leagueIds = leagues.map(({id}) => id)
    return leagueIds
}

module.exports.fetchCurrentLeague = async (selectedLeague) => {
    const validLeagues = await this.fetchActiveLeagues()
    const currentLeague = validLeagues.includes(selectedLeague) ? selectedLeague : FALLBACK_LEAGUE
    return currentLeague
}