class Environment {
  constructor () {
    const matchTime = process.env.MATCH_TIME || '11:30'

    this.locationsRegExp = /^(#[a-z_-]*\/[a-z_-]*:[a-z_-\s0-9]*(,[a-z_-\s0-9]*)*)+$/ig
    this.matchTimeRegExp = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ig

    this.token = process.env.TOKEN
    this.userToken = process.env.USER_TOKEN
    this.secret = process.env.SECRET
    this.slackProfileStorage = process.env.SLACK_DB === 'true'
    this.port = process.env.PORT || 3000
    this.matchSize = parseInt(process.env.MATCH_SIZE || '2', 10)
    this.locations = this.extractLocations(process.env.LOCATIONS)
    this.timezones = this.extractTimezones(process.env.LOCATIONS)
    this.matchTime = {
      cron: matchTime.split(':').reverse().join(' '),
      pretty: this.prettifyTime(matchTime)
    }
  }

  validate () {
    if (!process.env.LOCATIONS) {
      throw Error('Please provide a comma-separated list of locations as `LOCATIONS`.')
    }

    if (!process.env.LOCATIONS.match(this.locationsRegExp)) {
      throw Error('Please use the `LOCATIONS` schema listed in the documentation.')
    }

    if (!process.env.TOKEN) {
      throw Error('Please provide the related Slack OAuth Bot Token as `TOKEN`.')
    }

    if (!process.env.USER_TOKEN) {
      throw Error('Please provide the related Slack OAuth User Token as `USER_TOKEN`.')
    }

    if (!process.env.SECRET) {
      throw Error('Please provide the related Slack Signing Secret as `SECRET`.')
    }

    if (process.env.MATCH_TIME && !process.env.MATCH_TIME.match(this.matchTimeRegExp)) {
      throw Error('Please provide the `MATCH_TIME` as 24hr format.')
    }
  }

  prettifyTime (time) {
    let [hours, minutes] = time.split(':')
    let modifier = 'am'

    hours = parseInt(hours, 10)

    if (hours > 12) {
      modifier = 'pm'
      hours -= 12
    }

    if (hours === 0) {
      hours = 12
    }

    return `${hours < 10 ? `0${hours}` : hours}:${minutes}${modifier}`
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
