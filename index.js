const express = require('express')
const cors = require('cors')
const path = require('path')

const ballots = require('./votes.json')

// Create the server
const app = express()

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))

// Serve our api route /cow that returns a custom talking text cow
app.get('/get_ballot/:number', cors(), async (req, res, next) => {
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

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

// Choose the port and start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
})
