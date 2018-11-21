const to = require('uffbasse')

module.exports = (BaseAdapter) => class StorageErrorWrapper extends BaseAdapter {
  async wrap (fn, args, defaults) {
    const [err, res] = await to(super[fn](...args), { defaults })
    if (err) throw err

    return res
  }

  init (...args) {
    return this.wrap('init', args)
  }

  has (...args) {
    return this.wrap('has', args, true)
  }

  in (...args) {
    return this.wrap('in', args, false)
  }

  push (...args) {
    return this.wrap('push', args, true)
  }

  pop (...args) {
    return this.wrap('pop', args)
  }

  match (...args) {
    return this.wrap('match', args, [])
  }

  purge (...args) {
    return this.wrap('purge', args)
  }

  setSchedule (...args) {
    return this.wrap('setSchedule', args)
  }

  getSchedule (...args) {
    return this.wrap('getSchedule', args, [])
  }

  nextSchedule (...args) {
    return this.wrap('nextSchedule', args, [])
  }

  listSchedule (...args) {
    return this.wrap('listSchedule', args, {})
  }
}
