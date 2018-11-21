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
      .find((x) => this.locations[x].includes(user))
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
    Object.keys(this.locations).forEach((x) => {
      const idx = this.locations[x].indexOf(user)

      if (idx !== -1) {
        this.locations[x].splice(idx, 1)
      }
    })
  }

  async match (locations) {
    const locationIds = Object.keys(this.locations)
      .filter((x) => locations.includes(x))

    const matchesPerLocation = locationIds.map((x) => (
      this.chunk(this.locations[x].sort(this.shuffle))
    ))

    return this.flatten(matchesPerLocation)
  }

  async purge (locations) {
    locations.forEach(id => delete this.locations[id])
  }

  async setSchedule (user, location, datetime) {
    if (!this.schedule[location]) {
      this.schedule[location] = []
    }

    this.schedule[location].push(datetime)
  }

  async getSchedule (datetime) {
    const locations = []

    Object.keys(this.schedule).forEach((location) => {
      const idx = this.schedule[location].indexOf(datetime)

      if (idx !== -1) {
        this.schedule[location].splice(idx, 1)
        locations.push(location)
      }
    })

    return locations
  }

  async nextSchedule (location) {
    const schedule = this.schedule[location]

    if (schedule && schedule.length) {
      return schedule.sort()[0]
    }

    return null
  }

  async listSchedule () {
    return this.schedule
  }
}
