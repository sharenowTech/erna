class Environment {
  constructor () {
    this.locationsRegExp = /^(#[a-z_-]*\/[a-z_-]*:[a-z_-\s0-9]*(,[a-z_-\s0-9]*)*)+$/ig
    this.token = process.env.TOKEN
    this.secret = process.env.SECRET
    this.slackProfileStorage = process.env.SLACK_DB === 'true'
    this.port = process.env.PORT || 3000
    this.matchSize = parseInt(process.env.MATCH_SIZE || '2', 10)
    this.locations = this.extractLocations(process.env.LOCATIONS)
    this.timezones = this.extractTimezones(process.env.LOCATIONS)
  }

  validate () {
    if (!process.env.LOCATIONS) {
      throw Error('Please provide a comma-separated list of locations as `LOCATIONS`.')
    }

    if (!process.env.LOCATIONS.match(this.locationsRegExp)) {
      throw Error('Please use the `LOCATIONS` schema listed in the documentation.')
    }

    if (!process.env.TOKEN) {
      throw Error('Please provide the related Slack OAuth Token as `TOKEN`.')
    }

    if (!process.env.SECRET) {
      throw Error('Please provide the related Slack Signing Secret as `SECRET`.')
    }
  }

  extractTimezones (locations) {
    const timezones = locations.split('#')
    timezones.shift()

    const mapping = {}

    timezones.forEach(x => {
      const [tz, cities] = x.split(':')
      mapping[tz] = cities.split(',')
    })

    return mapping
  }

  extractLocations (locations) {
    const timezones = locations.split('#')
    timezones.shift()

    return [].concat(...timezones.map(x => x.split(':')[1]))
      .join(',')
      .split(',')
  }
}

module.exports = new Environment()
