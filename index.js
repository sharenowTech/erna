require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const Cron = require('cron').CronJob
const env = require('./lib/env')
const middleware = require('./lib/middleware')
const handlers = require('./lib/handlers')
const gatekeeper = require('./lib/gatekeeper')
const storage = require('./lib/storage')

storage.init()
const app = express()
const crons = {}

app.use(bodyParser.json({ verify: middleware.rawBody }))
app.use(bodyParser.urlencoded({ extended: true, verify: middleware.rawBody }))

app.get('/', (req, res) => res.json({ status: 'ok' }))
app.post('/commands', gatekeeper.lock, middleware.async(handlers.commands))
app.post('/actions', gatekeeper.lock, middleware.async(handlers.actions))

Object.keys(env.locations.tzs).forEach(timezone => {
  const cities = env.locations.tzs[timezone].map(x => x.toLowerCase())

  crons[timezone] = new Cron(`${env.matchTime.cron} * * MON-FRI`, handlers.match(cities), null, true, timezone)
})

app.listen(env.port, () => console.log('server listening'))
