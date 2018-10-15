const bounce = require('bounce')

module.exports = (BaseAdapter) => class StorageErrorWrapper extends BaseAdapter {
  async wrap (fn, args) {
    try {
      const res = await super[fn](...args)
      return res
    } catch (err) {
      bounce.rethrow(err, 'system')
      console.error(err)
    }
  }

  init (...args) {
    return this.wrap('init', args)
  }

  has (...args) {
    return this.wrap('has', args)
  }

  push (...args) {
    return this.wrap('push', args)
  }

  match (...args) {
    return this.wrap('match', args)
  }

  purge (...args) {
    return this.wrap('purge', args)
  }
}
