const environment = require('../environment')
const InMemoryStorage = require('./inMemory')
const SlackProfileStorage = require('./slackProfile')

module.exports = new (environment.slackProfileStorage ? SlackProfileStorage : InMemoryStorage)()
