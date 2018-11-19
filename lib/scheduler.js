const moment = require('moment')
const env = require('./env')

class Scheduler {
  constructor () {
    this.events = {}
  }

  add (timezone, cron) {
    this.events[timezone] = cron.nextDates(250)
    cron.stop()
  }

  find (time) {
    const tzs = Object.keys(this.events).filter(tz => this.events[tz][0] === time)
    tzs.forEach(tz => this.events[tz].shift())

    return tzs.reduce((cities, tz) => [...cities, ...env.locations.tzs[tz]], [])
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
