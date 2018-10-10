module.exports = class Environment {
  static validate () {
    if (!process.env.LOCATIONS) {
      throw Error('Please provide a comma-separated list of locations as `LOCATIONS`.')
    }

    if (!process.env.TOKEN) {
      throw Error('Please provide the related Slack OAuth Token as `TOKEN`.')
    }
  }

  static get locations () {
    return process.env.LOCATIONS.split(',')
  }

  static get token () {
    return process.env.TOKEN
  }

  static get port () {
    return process.env.PORT || 3000
  }
}
