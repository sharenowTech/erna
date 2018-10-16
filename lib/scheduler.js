const moment = require('moment')
const env = require('./env')

class Scheduler {
  constructor () {
    this.crons = {}
  }

  add (timezone, cron) {
    this.crons[timezone] = cron
  }

  getNext (city) {
    const tz = Object.keys(env.locations.tzs).find(x => env.locations.tzs[x].includes(city))
    const nextDate = this.crons[tz].nextDates()
    const isToday = moment(nextDate).isSame(moment(), 'day')
    const format = `${isToday ? '[today]' : 'dddd, MMMM Do'} [at] h:mma`

    return this.crons[tz].nextDates().format(format)
  }
}

module.exports = new Scheduler()
