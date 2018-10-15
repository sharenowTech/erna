const { WebClient } = require('@slack/client')
const environment = require('./environment')
const postman = require('./postman')

class Slack {
  constructor () {
    this.web = new WebClient(environment.token)
    this.icon = ':knife_fork_plate:'
    this.username = 'erna'
    this.init()
  }

  async init () {
    this.botId = await this.getBotId()
  }

  async getBotId () {
    const { members } = await this.web.users.list()
    const botUser = members.find(x => x.name === 'erna')

    if (!botUser) {
      throw Error('Cannot find a bot user with the name `erna`.')
    }

    return botUser.id
  }

  openConversation (users) {
    return this.web.conversations.open({ users: users.join(',') })
  }

  sendMessage (channel, text) {
    return this.web.chat.postMessage({
      icon_emoji: this.icon,
      username: this.username,
      channel,
      text
    })
  }

  rejectMatch (userId) {
    return this.sendMessage(userId, postman.nope)
  }

  broadcastMatch (match) {
    match.forEach((userId) => this.sendMessage(
      userId,
      postman.hooray(match.filter(x => x !== userId))
    ))
  }

  async triggerMatch (match) {
    if (match.length === 1) {
      return this.rejectMatch(match[0])
    }

    const conversationUsers = [...match]

    if (this.botId) {
      conversationUsers.push(this.botId)
    }

    const { ok, channel } = await this.openConversation(conversationUsers)

    if (!ok) {
      return this.broadcastMatch(match)
    }

    return this.sendMessage(channel.id, postman.hoorayAll(match))
  }
}

module.exports = new Slack()
