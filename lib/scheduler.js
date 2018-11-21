const moment = require('moment')
const storage = require('./storage')
const env = require('./env')

class Scheduler {
  constructor () {
    this.events = {}
  }

  add (tz, cron) {
    const interval = env.matchInterval.list

    this.events[tz] = cron.nextDates(250 * (6 - interval.length))
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

  async getNext (location) {
    const tz = Object.keys(env.locations.tzs).find(x => env.locations.tzs[x].includes(location))
    const nextRegular = this.events[tz][0]
    const nextSchedule = await storage.nextSchedule(location)
    const nextDate = !nextSchedule || (nextRegular < nextSchedule) ? nextRegular : nextSchedule
    const isToday = moment(nextDate).isSame(moment(), 'day')
    const format = `${isToday ? '[today]' : 'dddd, MMMM Do'} [at] h:mma`

    return {
      date: moment(nextDate).tz(tz).format(format),
      isCustom: nextSchedule && (nextRegular >= nextSchedule)
    }
  }
}

module.exports = new Scheduler()
