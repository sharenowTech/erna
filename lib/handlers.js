const qs = require('querystring')
const axios = require('axios')
const storage = require('./storage')
const environment = require('./environment')

const duplicateAlert = { text: 'You are already registered for the next lunch 😉.' }
const confirmation = { text: 'Great! I will notify you at 11:30am about your match right here in Slack.' }
const locationsPrompt = {
  attachments: [
    {
      text: 'Hi, I\'m *Erna*. I will find a lunch date for you.\nWhere are you located? 😊',
      fallback: 'You are unable to choose a location 😔.',
      callback_id: 'location',
      color: '#00a0e1',
      attachment_type: 'default',
      actions: [{
        name: 'location',
        type: 'select',
        text: 'Location',
        options: environment.locations.map((location) => ({
          text: location,
          value: location.toLowerCase()
        }))
      }]
    }
  ]
}

const notify = (userId, matches) => {
  const opts = {
    token: environment.token,
    channel: userId,
    icon_emoji: ':knife_fork_plate:',
    username: 'erna',
    text: `Your lunch date: ${matches.map(x => `<@${x}>`).join(' & ')}.\nGet in touch and enjoy your lunch! 😋`
  }

  if (!matches.length) {
    opts.text = 'Sorry, we didn\'t find anyone today. Try again tomorrow!'
  }

  axios.get(`https://slack.com/api/chat.postMessage?${qs.stringify(opts)}`)
    .then(({ data }) => console.log(data))
    .catch(console.error)
}

const signup = (res, key, value) => {
  const result = storage.push(key, value)

  return res.json(result ? confirmation : duplicateAlert)
}

const promptLocations = (req, res) => {
  if (environment.locations.length === 1) {
    return signup(res, environment.locations[0], req.body.user_id)
  }

  return res.json(locationsPrompt)
}

const confirm = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const location = payload.actions[0].selected_options[0].value
  const userId = payload.user.id

  return signup(res, location, userId)
}

const match = (cities) => () => {
  storage.match(cities).forEach((match) => {
    match.forEach((userId) => notify(userId, match.filter(x => x !== userId)))
  })

  storage.purge()
}

module.exports = {
  promptLocations,
  confirm,
  match
}
