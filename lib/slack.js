const qs = require('querystring')
const axios = require('axios')
const environment = require('./environment')
const postman = require('./postman')

class Slack {
  constructor () {
    this.apiUrl = 'https://slack.com/api'
    this.icon = ':knife_fork_plate:'
    this.username = 'erna'
  }

  request (method, endpoint, opts) {
    const query = Object.assign({ token: environment.token }, opts)
    const requestUrl = `${this.apiUrl}/${endpoint}?${qs.stringify(query)}`

    return axios[method](requestUrl)
      .then(({ data }) => (!data.ok && console.log(data)) || data)
      .catch(console.error)
  }

  openConversation (users) {
    return this.request('post', 'conversations.open', { users: users.join(',') })
  }

  sendMessage (channel, text) {
    return this.request('post', 'chat.postMessage', {
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