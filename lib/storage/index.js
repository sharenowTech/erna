const environment = require('../environment')
const InMemoryStorage = require('./inMemory')
const SlackProfileStorage = require('./slackProfile')

const Storage = environment.slackProfileStorage ? SlackProfileStorage : InMemoryStorage
module.exports = new Storage(environment.locations)
