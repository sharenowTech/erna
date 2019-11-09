const { WebClient } = require('@slack/client')
const to = require('uffbasse')
const env = require('./env')
const postman = require('./postman')

class Slack {
  constructor () {
    this.web = new WebClient(env.token)
    this.icon = ':knife_fork_plate:'
    this.username = env.botName
    this.init()
  }

  async init () {
    const data = await this.web.users.list()

    if (!data.ok || !data.members) {
      throw new Error('Cannot fetch members.')
    }

    const botUser = data.members.find((x) => x.name === env.botName)

    if (!botUser) {
      throw new Error(`Cannot find a bot user with the name '${env.botName}'.`)
    }

    this.botId = botUser.id
  }

  async openConversation (users) {
    return this.web.conversations.open({ users: users.join(',') })
  }

  async sendMessage (channel, text, blocks) {
    const msg = {
      icon_emoji: this.icon,
      username: this.username,
      channel,
      text,
      ...(blocks ? { blocks } : {})
    }

    return this.web.chat.postMessage(msg)
  }

  async sendToAll (blocks) {
    const data = (await this.web.users.list()).members.map(x => x.id)
    return data.map((x) => this.sendMessage(x, 'Hiya, it\'s Erna!', blocks))
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
      console.info('Pairing failed: anyone has signed up.')
      return
    }

    if (match.length === 1) {
      console.info('Pairing failed: just one has signed up.')
      return this.rejectMatch(match[0])
    }

    const conversationUsers = [...match]

    if (this.botId) {
      conversationUsers.push(this.botId)
    }

    const [err, { ok, error, channel }] = await to(this.openConversation(conversationUsers), { defaults: {} })

    if (err || !ok || error) {
      console.info(`Open conversation failed: ${err || error || 'no further information available.'}`)
      return this.broadcastMatch(match)
    }

    return this.sendMessage(channel.id, postman.matchGroup(match))
  }
}

module.exports = new Slack()
