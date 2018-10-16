require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const Cron = require('cron').CronJob
const environment = require('./lib/environment')
const handlers = require('./lib/handlers')
const gatekeeper = require('./lib/gatekeeper')
const storage = require('./lib/storage')

environment.validate()
storage.init()

const app = express()
const crons = {}
const rawBodySaver = (req, res, buf, encoding) => {
  req.rawBody = buf && buf.length ? buf.toString(encoding || 'utf8') : undefined
}

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

app.use(bodyParser.json({ verify: rawBodySaver }))
app.use(bodyParser.urlencoded({ extended: true, verify: rawBodySaver }))

app.get('/', (req, res) => res.json({ status: 'ok' }))
app.post('/commands', gatekeeper.lock, asyncMiddleware(handlers.commands))
app.post('/actions', gatekeeper.lock, asyncMiddleware(handlers.actions))

Object.keys(environment.timezones).forEach(timezone => {
  const cities = environment.timezones[timezone].map(x => x.toLowerCase())

  crons[timezone] = new Cron(`${environment.matchTime.cron} * * MON-FRI`, handlers.match(cities), null, true, timezone)
})

app.listen(environment.port, () => console.log('server listening'))
