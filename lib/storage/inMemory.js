const Adapter = require('./adapter')

module.exports = class InMemoryStorage extends Adapter {
  constructor () {
    super()
    this.locations = {}
    this.users = {}
    this.schedule = {}
  }

  async has (user) {
    return this.users[user]
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
      this.users[user] = true
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

  async setSchedule (location, datetime) {
    if (!this.schedule[location]) {
      this.schedule[location] = []
    }

    this.schedule[location].push(datetime)
  }

  async getSchedule (datetime) {
    const cities = []

    Object.keys(this.schedule).forEach(city => {
      const idx = this.schedule[city].indexOf(datetime)

      if (idx !== -1) {
        this.schedule[city].splice(idx, 1)
        cities.push(city)
      }
    })

    return cities
  }

  async listSchedule () {
    return this.schedule
  }
}
