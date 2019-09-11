const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')

const env = process.env.NODE_ENV || 'development'
const PROD = env === 'production'

class Server {
    constructor(ballots, candidates) {
        this.port = Server.DEFAULTS.port

        this.ballots = ballots

        this.candidates = candidates

        this.server = express()

        this.setup()
    }

    setup() {
        if (PROD) this.server.use(this.forceSSL)
        this.setupStatic()
        this.setupApi()
        this.setupDefault()
        this.startServer()      
    }

    startServer() {
        const server = PROD ? this.server : https.createServer({
            key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
            cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
        }, this.server)
        
        server.listen(this.port, () => {
            console.log(`Verification server started on port: ${this.port}`)
        })
    }

    setupDefault() {
        this.server.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/build/index.html'))
        })
    }

    setupStatic() {
        this.server.use(express.static(path.join(__dirname, '../client/build')))
    }

    setupApi() {
        this.server.get('/get_ballot/:number', async (req, res, next) => {
            try {
                const number = req.params.number
                if (this.ballots[number]) {
                    res.json({ ballot: this.ballots[number] })
                } else {
                    res.status(404).json({
                        error: "Ballot number not found."

                    })
                }

            } catch (err) {
                next(err)
            }
        })

        this.server.get('/get_candidates', async (req, res, next) => {
            try {
                res.json(this.candidates)
            } catch (err) {
                next(err)
            }
        })
    }

    forceSSL (req, res, next)  {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(['https://', req.get('Host'), req.url].join(''))
        }
        return next()
    }
}

Server.DEFAULTS = {
    port: process.env.PORT || 5000
}

module.exports = Server