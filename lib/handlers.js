const qs = require('querystring')
const axios = require('axios')
const storage = require('./storage')
const environment = require('./environment')

const confirmation = { text: 'Thanks! Your match will be privatley announced at 11:30am.' }
const locationsPrompt = {
  attachments: [
    {
      text: 'Choose your current location.',
      fallback: 'You are unable to choose a location.',
      callback_id: 'location',
      color: '#00a0e1',
      attachment_type: 'default',
      actions: environment.locations.map((location) => ({
        name: 'location',
        type: 'button',
        text: location,
        value: location.toLowerCase()
      }))
    }
  ]
}

const notify = (userId, matches) => {
  const opts = {
    token: environment.token,
    channel: userId,
    icon_emoji: ':fork_and_knife:',
    username: 'erna',
    text: `You matched with ${matches.map(x => `<@${x}>`).join(' & ')}. Enjoy your lunch!`
  }

  if (!matches.length) {
    opts.text = 'Sorry, we didn\'t find anyone today. Try again tomorrow!'
  }

  axios.get(`https://slack.com/api/chat.postMessage?${qs.stringify(opts)}`)
    .then(({ data }) => console.log(data))
    .catch(console.error)
}

const signup = (res, key, value) => {
  storage.push(key, value)

  return res.json(confirmation)
}

const promptLocations = (req, res) => {
  if (environment.locations.length === 1) {
    return signup(res, environment.locations[0], req.body.user_id)
  }

  return res.json(locationsPrompt)
}

const confirm = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const location = payload.actions[0].value
  const userId = payload.user.id

  return signup(res, location, userId)
}

const match = () => {
  storage.match().forEach((match) => {
    match.forEach((userId) => notify(userId, match.filter(x => x !== userId)))
  })

  storage.purge()
}

module.exports = {
  promptLocations,
  confirm,
  match
}
