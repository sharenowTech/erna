const moment = require('moment')
const storage = require('./storage')
const env = require('./env')

class Scheduler {
  constructor () {
    this.events = {}
  }

  add (timezone, cron) {
    const interval = env.matchInterval.list

    this.events[timezone] = cron.nextDates(250 * (6 - interval.length))
      .filter((date) => interval.includes(parseInt((date.date() - 1) / 7, 10) + 1))
      .map((date) => date.toISOString())

    cron.stop()
  }

  async find (datetime) {
    const tzs = Object.keys(this.events).filter((tz) => this.events[tz][0] === datetime)
    tzs.forEach((tz) => this.events[tz].shift())

    const scheduledLocations = await storage.getSchedule(datetime)
    const locations = new Set(scheduledLocations)

    tzs.forEach((tz) => env.locations.tzs[tz].forEach((location) => locations.add(location)))
    return [...locations]
  }

  getNext (location) {
    const tz = Object.keys(env.locations.tzs).find(x => env.locations.tzs[x].includes(location))
    const nextDate = this.events[tz][0]
    const isToday = moment(nextDate).isSame(moment(), 'day')
    const format = `${isToday ? '[today]' : 'dddd, MMMM Do'} [at] h:mma`

    return nextDate.format(format)
  }
}

module.exports = new Scheduler()
