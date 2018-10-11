const qs = require('querystring')
const axios = require('axios')
const storage = require('./storage')
const environment = require('./environment')
const postman = require('./postman')

const notify = (userId, matches) => {
  const opts = {
    token: environment.token,
    channel: userId,
    icon_emoji: ':knife_fork_plate:',
    username: 'erna',
    text: postman.hooray(matches)
  }

  if (!matches.length) {
    opts.text = postman.nope
  }

  axios.get(`https://slack.com/api/chat.postMessage?${qs.stringify(opts)}`)
    .then(({ data }) => console.log(data))
    .catch(console.error)
}

const signup = (res, key, value) => {
  const result = storage.push(key, value)

  return res.json(result ? postman.confirmation : postman.duplicate)
}

const promptLocations = (req, res) => {
  if (storage.has(req.body.user_id)) {
    return res.json(postman.duplicate)
  }

  if (environment.locations.length === 1) {
    return signup(res, environment.locations[0], req.body.user_id)
  }

  return res.json(postman.locations)
}

const feedback = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const action = payload.actions[0].name

  switch (action) {
    case 'location':
      confirm(payload, res)
      break
    case 'cancel':
      res.json(postman.cancel)
      break
  }
}

const confirm = (payload, res) => {
  const location = payload.actions[0].selected_options[0].value
  const userId = payload.user.id

  return signup(res, location, userId)
}

const match = (cities) => () => {
  storage.match(cities).forEach((match) => {
    match.forEach((userId) => notify(userId, match.filter(x => x !== userId)))
  })

  storage.purge(cities)
}

module.exports = {
  promptLocations,
  feedback,
  match
}
