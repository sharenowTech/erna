const BaseStorage = require('./baseStorage')

module.exports = class InMemoryStorage extends BaseStorage {
  constructor () {
    super()
    this.locations = {}
  }

  async has (user) {
    return Object.values(this.locations)
      .filter(x => !!x)
      .some(x => x.includes(user))
  }

  async push (key, value) {
    if (!this.locations[key]) {
      this.locations[key] = []
    }

    if (!await this.has(value)) {
      this.locations[key].push(value)
      return true
    }

    return false
  }

  async match (cities) {
    const locationIds = Object.keys(this.locations)
    const filteredLocationIds = locationIds.filter((id) => cities.includes(id))
    const matchesPerLocation = filteredLocationIds.map((id) => this.chunk(this.locations[id].sort(this.shuffle)))

    return [].concat(...matchesPerLocation)
  }

  async purge (cities) {
    cities.forEach((city) => {
      delete this.locations[city]
    })
  }
}
