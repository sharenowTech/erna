const express = require('express')
const bodyParser = require('body-parser')
const Cron = require('cron').CronJob
const environment = require('./lib/environment')
const handlers = require('./lib/handlers')
require('dotenv').config()

environment.validate()

const app = express()
const crons = {}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.json({ status: 'ok' }))
app.post('/', handlers.promptLocations)
app.post('/folks', handlers.feedback)

Object.keys(environment.timezones).forEach(timezone => {
  const cities = environment.timezones[timezone].map(x => x.toLowerCase())

  crons[timezone] = new Cron('30 11 * * MON-FRI', handlers.match(cities), null, true, timezone)
})

app.listen(environment.port, () => console.log('server listening'))
