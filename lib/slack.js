const { WebClient } = require('@slack/client')
const to = require('uffbasse')
const env = require('./env')
const postman = require('./postman')

class Slack {
  constructor () {
    this.web = new WebClient(env.token)
    this.icon = ':knife_fork_plate:'
    this.username = 'erna'
    this.init()
  }

  async init () {
    const data = await this.web.users.list()

    if (!data.ok || !data.members) {
      console.log(data)
      throw new Error('Cannot fetch members.')
    }

    const botUser = data.members.find(x => x.name === 'erna')

    if (!botUser) {
      throw new Error('Cannot find a bot user with the name `erna`.')
    }

    this.botId = botUser.id
  }

  async openConversation (users) {
    return this.web.conversations.open({ users: users.join(',') })
  }

  async sendMessage (channel, text) {
    return this.web.chat.postMessage({
      icon_emoji: this.icon,
      username: this.username,
      channel,
      text
    })
  }

  async rejectMatch (userId) {
    return this.sendMessage(userId, postman.noMatch)
  }

  async broadcastMatch (match) {
    await Promise.all(match.map((userId) => this.sendMessage(
      userId,
      postman.match(match.filter(x => x !== userId))
    )))
  }

  async triggerMatch (match) {
    if (match.length === 0) {
      return
    }

    if (match.length === 1) {
      return this.rejectMatch(match[0])
    }

    const conversationUsers = [...match]

    if (this.botId) {
      conversationUsers.push(this.botId)
    }

    const [, { ok, channel }] = await to(this.openConversation(conversationUsers))

    if (!ok) {
      return this.broadcastMatch(match)
    }

    return this.sendMessage(channel.id, postman.matchGroup(match))
  }
}

module.exports = new Slack()
