const moment = require('moment')
const storage = require('./storage')
const env = require('./env')

class Scheduler {
  constructor () {
    this.events = {}
    this.temp = {}
  }

  cache (key, data) {
    this.temp[key] = data
  }

  popCache (key) {
    const data = this.temp[key]
    delete this.temp[data]

    return data
  }

  async add (tz, cron) {
    const interval = env.matchInterval.list

    this.events[tz] = cron.nextDates(250 * (6 - interval.length))
      .filter((date) => interval.includes(parseInt((date.date() - 1) / 7, 10) + 1))
      .map((date) => date.toISOString())

    cron.stop()
  }

  remove (datetime) {
    Object.keys(this.events).forEach((tz) => {
      const localDatetime = moment.tz(datetime, 'YYYY-MM-DD HH:mm', tz).toISOString()
      this.events[tz] = this.events[tz].filter((x) => x !== localDatetime)
    })
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
    const { time: nextSchedule, title } = await storage.nextSchedule(location)

    if (!nextSchedule && !this.events[tz].length) {
      return false
    }

    const isCustom = (nextSchedule && !this.events[tz].length) || (nextSchedule && (nextSchedule <= nextRegular))
    const nextDate = isCustom ? nextSchedule : nextRegular

    const isToday = moment(nextDate).isSame(moment(), 'day')
    const isTomorrow = moment(nextDate).isSame(moment().add(1, 'day'), 'day')
    const format = `${isToday ? '[today]' : isTomorrow ? '[tomorrow]' : 'dddd, MMMM Do'} [at] h:mma`

    return {
      isCustom,
      date: moment(nextDate).tz(tz).format(format),
      title: isCustom && title
    }
  }
}

module.exports = new Scheduler()
