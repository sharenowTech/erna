const InMemoryStorage = require('./inMemory')
const MongoStorage = require('./mongoStorage')
const env = require('../env')

module.exports = (() => {
  switch (env.db.type) {
    case 'mongodb':
      return new MongoStorage()
    default:
      return new InMemoryStorage()
  }
})()
