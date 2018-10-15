const { WebClient } = require('@slack/client')
const environment = require('../environment')
const InMemoryStorage = require('./inMemory')

module.exports = class SlackProfileStorage extends InMemoryStorage {
  constructor (locations) {
    super()
    this.web = new WebClient(environment.userToken)
    this.init(locations)
  }

  async getBotId () {
    const { members } = await this.web.users.list()
    const botUser = members.find(x => x.name === 'erna')

    if (!botUser) {
      throw Error('Cannot find a bot user with the name `erna`.')
    }

    return botUser.id
  }

  async getUsergroups () {
    const { ok, usergroups } = await this.web.usergroups.list()

    return ok ? usergroups : []
  }

  async init (locations) {
    const usergroupNames = locations.map(x => `erna.${x.toLowerCase()}`)
    const existingUsergroupNames = (await this.getUsergroups()).map(x => x.name)
    const botId = await this.getBotId()

    await Promise.all(usergroupNames
      .filter(x => !existingUsergroupNames.includes(x))
      .map(async (x) => {
        const { usergroup } = await this.web.usergroups.create({ name: x })
        return this.web.usergroups.users.update({ usergroup: usergroup.id, users: botId })
      })
    )

    this.locationGroups = (await this.getUsergroups())
      .filter(x => x.name.startsWith('erna.'))
      .reduce((acc, group) => {
        acc[group.name.split('.')[1]] = group.id

        return acc
      }, {})
  }

  async has (user) {
    const profile = await this.web.users.profile.get({ user })
    console.log(profile)

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

    const signups = users.members
      .filter(x => x.profile[this.field])
      .reduce((acc, user) => {
        const userId = user.id
        const location = user.profile[this.field]

        if (!acc[location]) {
          acc[location] = []
        }

        acc[location].push(userId)
      }, {})

    return signups
  }
}
