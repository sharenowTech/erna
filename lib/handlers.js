const storage = require('./storage')
const environment = require('./environment')
const postman = require('./postman')
const slack = require('./slack')

const signup = async (res, key, value) => {
  const result = await storage.push(key, value)

  return res.json(result ? postman.confirmation : postman.duplicate)
}

const commands = async (req, res) => {
  const subcmd = req.body.text.split(' ')[0]

  switch (subcmd) {
    default:
      if (await storage.has(req.body.user_id)) {
        return res.json(postman.duplicate)
      }

      if (environment.locations.length === 1) {
        return signup(res, environment.locations[0], req.body.user_id)
      }

      return res.json(postman.locations)
  }
}

const actions = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const action = payload.actions[0].name

  switch (action) {
    case 'location':
      const location = payload.actions[0].selected_options[0].value
      const userId = payload.user.id

      return signup(res, location, userId)
    case 'cancel':
      return res.json(postman.cancel)
  }
}

const match = (cities) => async () => {
  (await storage.match(cities)).forEach(function (match) {
    slack.triggerMatch(match)
  })

  storage.purge(cities)
}

module.exports = {
  commands,
  actions,
  match
}
