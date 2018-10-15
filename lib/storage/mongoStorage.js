const { MongoClient } = require('mongodb')
const bounce = require('bounce')
const Adapter = require('./adapter')
const env = require('../env')

module.exports = class MongoStorage extends Adapter {
  async init () {
    const opts = { useNewUrlParser: true }

    try {
      const client = await MongoClient.connect(env.db.url, opts)

      this.db = client.db('erna')
      this.locations = await this.db.collection('locations')
    } catch (err) {
      bounce.rethrow(err, 'system')
      console.error(err)
    }
  }

  async has (user) {
    return !!(await this.locations.countDocuments({ users: user }))
  }

  async push (location, user) {
    if (await this.has(user)) {
      return false
    }

    await this.locations.updateOne(
      { location },
      { $push: { users: user } },
      { upsert: true }
    )

    return true
  }

  async match (cities) {
    const usersPerLocation = await this.locations.find({
      location: { $in: cities }
    }).map(location => location.users).toArray()

    const matchesPerLocation = usersPerLocation.map(users => (
      this.chunk(users).sort(this.shuffle)
    ))

    return this.flatten(matchesPerLocation)
  }

  async purge (cities) {
    await Promise.all(cities.map((location) => {
      this.locations.deleteOne({ location })
    }))
  }
}
