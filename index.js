const axios = require('axios')
const chalk = require('chalk')
const Server = require('./server/server.js')

const { VOTES, CANDIDATES } = require('./elections/dev/urls')

/**
 * Verification server entrypoint. Fetches ballots and 
 * candidates, and starts the server.
 */
async function init() {
  try {
    const ballotsRes    = await axios.get(VOTES)
    const candidatesRes = await axios.get(CANDIDATES)

    const ballots = ballotsRes.data
    const candidates = candidatesRes.data
    
    // console.log(chalk.green(`Successfully fetched ${Object.keys(ballots).length} votes`) + ` from ${VOTES}`)
    // console.log(chalk.green(`Successfully fetched ${Object.keys(candidates).length} candidates` + ` from ${CANDIDATES}`))

    new Server(ballots, candidates)
  } catch (err) {
    console.log('Error initializing app: ', err)
  }
}

init()
