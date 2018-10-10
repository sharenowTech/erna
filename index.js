const express = require('express')
const bodyParser = require('body-parser')
const cron = require('node-cron')
const environment = require('./lib/environment')
const handlers = require('./lib/handlers')
require('dotenv').config()

environment.validate()

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.json({ status: 'ok' }))
app.post('/', handlers.promptLocations)
app.post('/folks', handlers.confirm)
cron.schedule('30 11 * * MON-FRI', handlers.match)

app.listen(environment.port, () => console.log('server listening'))
