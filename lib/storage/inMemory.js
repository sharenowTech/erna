const Adapter = require('./adapter')

module.exports = class InMemoryStorage extends Adapter {
  constructor () {
    super()
    this.locations = {}
  }

  async in (user) {
    return Object.keys(this.locations)
      .find(id => this.locations[id].includes(user))
  }

  async push (location, user) {
    if (!this.locations[location]) {
      this.locations[location] = []
    }

    if (!await this.in(user)) {
      this.locations[location].push(user)
      return true
    }

    return false
  }

  async pop (user) {
    Object.keys(this.locations).forEach(id => {
      const idx = this.locations[id].indexOf(user)

      if (idx !== -1) {
        this.locations[id].splice(idx, 1)
      }
    })
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
