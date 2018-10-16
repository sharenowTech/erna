const to = require('uffbasse')
const storage = require('./storage')
const env = require('./env')
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

      if (env.locations.list.length === 1) {
        return signup(res, env.locations.list[0], req.body.user_id)
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
  const [err, matches] = await to(storage.match(cities), { defaults: [] })
  if (err) throw err

  matches.forEach(function (match) {
    slack.triggerMatch(match)
  })

  await to(storage.purge(cities))
}

module.exports = {
  commands,
  actions,
  match
}
