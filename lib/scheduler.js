const moment = require('moment')
const storage = require('./storage')
const env = require('./env')

class Scheduler {
  constructor () {
    this.events = {}
  }

  add (timezone, cron) {
    this.events[timezone] = cron.nextDates(250 * (6 - env.matchInterval.length))
      .filter(x => env.matchInterval.includes(parseInt((x.date() - 1) / 7, 10) + 1))
      .map(x => x.toISOString())

    cron.stop()
  }

  async find (time) {
    const tzs = Object.keys(this.events).filter(tz => this.events[tz][0] === time)
    tzs.forEach(tz => this.events[tz].shift())

    const scheduledCities = await storage.getSchedule(time)
    const cities = new Set(scheduledCities)

    tzs.forEach(tz => env.locations.tzs[tz].forEach(city => cities.add(city)))
    return [...cities]
  }

  getNext (city) {
    const tz = Object.keys(env.locations.tzs).find(x => env.locations.tzs[x].includes(city))
    const nextDate = this.events[tz][0]
    const isToday = moment(nextDate).isSame(moment(), 'day')
    const format = `${isToday ? '[today]' : 'dddd, MMMM Do'} [at] h:mma`

    return nextDate.format(format)
  }
}

module.exports = new Scheduler()
