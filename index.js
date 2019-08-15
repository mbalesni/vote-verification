const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')

const ballots = require('./votes.json')
const candidates = require('./candidates.json')

const env = process.env.NODE_ENV || 'development'
const PROD = env === 'production'

// Create the server
const app = express()

const forceSsl = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''))
  }
  return next()
}

if (PROD) app.use(forceSsl);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))

app.get('/get_ballot/:number', async (req, res, next) => {
  try {
    const number = req.params.number
    if (ballots[number]) {
      res.json({ ballot: ballots[number] })
    } else {
      res.json({
        error: "Ballot number not found."
      })
    }

  } catch (err) {
    next(err)
  }
})

app.get('/get_candidates', async (req, res, next) => {
  try {
    res.json(candidates)
  } catch (err) {
    next(err)
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

// Choose the port and start the server
const PORT = process.env.PORT || 5000

const server = PROD ? app : https.createServer({
  key: fs.readFileSync(path.resolve('server.key')),
  cert: fs.readFileSync(path.resolve('server.crt'))
}, app)

server.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
})
