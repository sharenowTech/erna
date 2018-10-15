const Adapter = require('./adapter')

module.exports = class InMemoryStorage extends Adapter {
  constructor () {
    super()
    this.locations = {}
  }

  async has (user) {
    return Object.values(this.locations)
      .some(x => x.includes(user))
  }

  async push (location, user) {
    if (!this.locations[location]) {
      this.locations[location] = []
    }

    if (!await this.has(user)) {
      this.locations[location].push(user)
      return true
    }

    return false
  }

  async match (cities) {
    const locationIds = Object.keys(this.locations)
      .filter(id => cities.includes(id))

    const matchesPerLocation = locationIds.map(id => (
      this.chunk(this.locations[id].sort(this.shuffle))
    ))

    return this.flatten(matchesPerLocation)
  }

  async purge (cities) {
    cities.forEach(id => delete this.locations[id])
  }
}
