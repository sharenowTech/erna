const { WebClient } = require('@slack/client')
const environment = require('./environment')
const postman = require('./postman')

class Slack {
  constructor () {
    this.web = new WebClient(environment.token)
    this.icon = ':knife_fork_plate:'
    this.username = 'erna'
  }

  log (data) {
    return (!data.ok && console.log(data)) || data
  }

  openConversation (users) {
    return this.web.conversations.open({ users: users.join(',') })
      .then(this.log).catch(console.error)
  }

  sendMessage (channel, text) {
    return this.web.chat.postMessage({
      icon_emoji: this.icon,
      username: this.username,
      channel,
      text
    }).then(this.log).catch(console.error)
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

  triggerMatch (match) {
    if (match.length === 1) {
      return this.rejectMatch(match[0])
    }

    return this.openConversation(match).then(({ ok, channel }) => {
      if (!ok) {
        return this.broadcastMatch(match)
      }

      return this.sendMessage(channel.id, postman.hoorayAll(match))
    })
  }
}

module.exports = new Slack()
