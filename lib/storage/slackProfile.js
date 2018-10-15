const { WebClient } = require('@slack/client')
const environment = require('../environment')
const InMemoryStorage = require('./inMemory')
const slack = require('../slack')

module.exports = class SlackProfileStorage extends InMemoryStorage {
  constructor () {
    super()
    this.web = new WebClient(environment.token)
    this.field = 'skype'
    this.has()
  }

  log (data) {
    return (!data.ok && console.log(data)) || data
  }

  async wrapGet (name, fn, args) {
    let result

    try {
      const data = await fn(args)
      if (!data.ok) console.log(data)
      result = data
    } catch (err) {
      console.error(err)
      result = super[name](args)
    }

    return result
  }

  // async wrap (name, fn, args) {
  //   let result

  //   try {
  //     const data = await fn(args)
  //     if (!data.ok) console.log(data)
  //     result = data
  //   } catch (err) {
  //     console.error(err)
  //     result = super[name](args)
  //   }

  //   return result
  // }

  async has (user) {
    const profile = await this.web.users.profile.get({ user })

    return !!profile[this.field]
  }

  async push (value, user) {
    const exists = await this.has(user)

    if (!exists) {
      await this.web.users.profile.set({
        name: this.field,
        user,
        value
      })

      return true
    }

    return false
  }

  async getSignUps () {
    const users = await this.web.users.list()
  }
}
