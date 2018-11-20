require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const Cron = require('cron').CronJob
const env = require('./lib/env')
const middleware = require('./lib/middleware')
const handlers = require('./lib/handlers')
const gatekeeper = require('./lib/gatekeeper')
const scheduler = require('./lib/scheduler')
const storage = require('./lib/storage')

process.on('unhandledRejection', console.error)

async function init () {
  await storage.init()
  const app = express()

  app.set('json spaces', 2)
  app.use(bodyParser.json({ verify: middleware.rawBody }))
  app.use(bodyParser.urlencoded({ extended: true, verify: middleware.rawBody }))

  app.get('/', (req, res) => res.json({ status: 'ok' }))
  app.get('/schedule', middleware.async(handlers.schedule))
  app.post('/commands', gatekeeper.lock, middleware.async(handlers.commands))
  app.post('/actions', gatekeeper.lock, middleware.async(handlers.actions))

  Object.keys(env.locations.tzs).forEach((tz) => {
    const cronPattern = `${env.matchTime.cron} * * ${env.matchDay.raw}`
    const cron = new Cron(cronPattern, () => {}, null, true, tz)

    scheduler.add(tz, cron)
  })

  scheduler.ticker = new Cron('* * * * *', handlers.match, null, true, null, null, null, 0)
  app.listen(env.port, () => console.log('server listening'))
}

init()
