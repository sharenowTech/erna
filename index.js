const express = require('express')
const bodyParser = require('body-parser')
const Cron = require('cron').CronJob
const environment = require('./lib/environment')
const handlers = require('./lib/handlers')
const storage = require('./lib/storage')
const gatekeeper = require('./lib/gatekeeper')
require('dotenv').config()

environment.validate()

const app = express()
const crons = {}
const rawBodySaver = (req, res, buf, encoding) => {
  req.rawBody = buf && buf.length ? buf.toString(encoding || 'utf8') : undefined
}

app.use(bodyParser.json({ verify: rawBodySaver }))
app.use(bodyParser.urlencoded({ extended: true, verify: rawBodySaver }))

app.get('/', (req, res) => res.json({ status: 'ok' }))
app.get('/locations', gatekeeper.lock, (req, res) => storage.list('locations', res))
app.post('/commands', gatekeeper.lock, handlers.commands)
app.post('/actions', gatekeeper.lock, handlers.actions)

Object.keys(environment.timezones).forEach(timezone => {
  const cities = environment.timezones[timezone].map(x => x.toLowerCase())

  crons[timezone] = new Cron('30 11 * * MON-FRI', handlers.match(cities), null, true, timezone)
})

app.listen(environment.port, () => console.log('server listening'))
