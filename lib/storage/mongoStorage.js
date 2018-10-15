const { MongoClient } = require('mongodb')
const BaseStorage = require('./baseStorage')

module.exports = class MongoStorage extends BaseStorage {
  async init () {
    const url = 'mongodb://erna:2962699@cluster0-shard-00-00-u0rra.mongodb.net:27017,cluster0-shard-00-01-u0rra.mongodb.net:27017,cluster0-shard-00-02-u0rra.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true'

    this.db = (await MongoClient.connect(url, { useNewUrlParser: true })).db('erna')
    this.locations = await this.db.collection('locations')
  }

  async has (users) {
    return !!(await this.locations.countDocuments({ users }))
  }

  async push (location, users) {
    if (await this.has(users)) {
      return false
    }

    await this.locations.updateOne({ location }, { $push: { users } }, { upsert: true })
    return true
  }

  async match (cities) {
    const usersPerLocation = await this.locations.find({
      location: { $in: cities }
    }).map(x => x.users).toArray()

    const matchesPerLocation = usersPerLocation.map(users => (
      this.chunk(users).sort(this.shuffle)
    ))

    return [].concat(...matchesPerLocation)
  }

  async purge (cities) {
    await Promise.all(cities.map((location) => {
      this.locations.deleteOne({ location })
    }))
  }
}
