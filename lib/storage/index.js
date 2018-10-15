const composeWrapper = require('./composeWrapper')
const InMemoryStorage = require('./inMemory')
const MongoStorage = require('./mongoStorage')
const env = require('../env')

module.exports = (() => {
  let BaseAdapter

  switch (env.db.type) {
    case 'mongodb':
      BaseAdapter = MongoStorage
      break
    default:
      BaseAdapter = InMemoryStorage
      break
  }

  return new (composeWrapper(BaseAdapter))()
})()
